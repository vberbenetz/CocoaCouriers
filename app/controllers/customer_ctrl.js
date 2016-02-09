'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var userCtrl = require('./user_ctrl');

var dbUtils = require('../utils/db_utils');

var stripe = require('stripe')(
    configPriv.sKey
);

var customerCtrl = function() {};

customerCtrl.prototype = {

    get: function (stId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT c.*, d.* FROM Customer c INNER JOIN BillingAddress d ON c.billingAddress_stripeId=d.stripeId WHERE c.stripeId = ?',
            params: stId
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(false, rows[0]);
            }
        });
    },

    getSources: function (stId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM Source WHERE ?',
            params: {
                stripeId: stId
            }
        };

        dbUtils.query(dbConnPool, query, function(err, sources) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(false, sources);
            }
        });
    },

    getSourceById: function (stId, sourceId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM Source WHERE stripeId=? AND sourceId=?',
            params: [
                stId,
                sourceId
            ]
        };

        dbUtils.query(dbConnPool, query, function(err, source) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(false, source[0]);
            }
        });
    },

    getAltShippingAddress: function (stId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM AltShippingAddress WHERE ? ORDER BY id DESC LIMIT 1',
            params: {
                stripeId: stId
            }
        };

        dbUtils.query(dbConnPool, query, function(err, altShippingAddr) {
            if (err) {
                return callback(err, null);
            }
            else {
                if (!altShippingAddr[0]) {
                    return callback(false, {});
                }
                else {
                    return callback(false, altShippingAddr[0]);
                }
            }
        });
    },

    create: function (req, res, dbConnPool, callback) {
        var email = req.user.email;
        var source = req.body.source;
        var billing = req.body.billing;
        var tax = calculateTaxPercentage(billing.address.state);

        // Move company to metadata from billing for stripe payload
        var company = null;
        if (billing.company) {
            company = billing.company;
            delete billing.company;
        }

        var payload = {
            email: email,
            shipping: billing,
            source: source,
            metadata: {
                taxRate: tax.rate,
                taxDesc: tax.desc,
                company: company
            }
        };

        var billingInsertQuery = {
            statement: 'INSERT INTO BillingAddress SET ?',
            params: {
                name: billing.name,
                company: company,
                street1: billing.address.line1,
                street2: billing.address.line2,
                street3: null,
                city: billing.address.city,
                state: billing.address.state,
                postalCode: billing.address.postal_code,
                country: billing.address.country
            }
        };

        stripe.customers.create(payload, function(stripeErr, stripeCustomer) {
            if (stripeErr) {
                return callback({
                    status: 500,
                    type: 'stripe',
                    msg: {
                        simplified: 'server_error',
                        detailed: stripeErr
                    }
                }, null);

            }
            else {
                log.info('Created customer on stripe', {customer: stripeCustomer}, req.connection.remoteAddress);

                var formattedSources = [];
                var sources = stripeCustomer.sources.data;
                for (var s = 0; s < sources.length; s++) {
                    formattedSources.push([
                        stripeCustomer.id,
                        sources[s].id,
                        sources[s].brand,
                        sources[s].country,
                        sources[s].last4
                    ]);
                }

                // Get list of customer sources and save
                var sourceInsertQuery = {
                    statement: 'INSERT INTO Source (stripeId, sourceId, brand, country, lastFour) VALUES ?',
                    params: [formattedSources]
                };

                // Async add sources
                dbUtils.query(dbConnPool, sourceInsertQuery, function(err, rows) {
                    if (err) {
                        log.error(err, null, null);
                    }
                });

                // Append stripe customer Id
                billingInsertQuery.params.stripeId = stripeCustomer.id;

                // Insert DefaultShippingAddress
                dbUtils.query(dbConnPool, billingInsertQuery, function(err, rows) {
                    if (err) {
                       return callback(err, null);
                    }
                    else {
                        log.info('Added BillingAddress on internal DB', {
                            billingAddress: billingInsertQuery.params
                        }, req.connection.remoteAddress);

                        var customerInsertQuery = {
                            statement: 'INSERT INTO Customer SET ?',
                            params: {
                                stripeId: stripeCustomer.id,
                                localId: req.user.id,
                                status: 'active',
                                created: new Date(stripeCustomer.created * 1000),
                                currency: stripeCustomer.currency,
                                defaultSource: stripeCustomer.default_source,
                                delinquent: stripeCustomer.delinquent,
                                email: payload.email,
                                taxRate: payload.metadata.taxRate,
                                taxDesc: payload.metadata.taxDesc,
                                billingAddress_stripeId: stripeCustomer.id
                            }
                        };

                        // Insert Customer
                        dbUtils.query(dbConnPool, customerInsertQuery, function (err, rows) {
                            if (err) {
                                return callback(err, null);
                            }
                            else {
                                log.info('Added customer on internal DB', {
                                    stripeId: stripeCustomer.id,
                                    localId: req.user.id
                                }, req.connection.remoteAddress);

                                // Update user with stripe customer Id
                                userCtrl.updateCustomerId(email, stripeCustomer.id, dbConnPool, function (err, result) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    else {
                                        var user = req.user;
                                        user.stId = stripeCustomer.id;
                                        return callback(false, user);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    },

    addAltShippingAddress: function (shipping, stripeId, dbConnPool, reqIP, callback) {

        if (!shipping || !shipping.address) {
            return callback({
                status: 400,
                type: 'app',
                msg: {
                    simplified: 'bad_request',
                    detailed: 'AltShipping parameters are undefined in CustomerCtrl.addAltShippingAddress'
                }
            }, null);
        }
        else if (!stripeId) {
            return callback({
                status: 500,
                type: 'app',
                msg: {
                    simplified: 'server_error',
                    detailed: 'StripeId (stId) does not exist in CustomerCtrl.addAltShippingAddress'
                }
            }, null);
        }
        else {
            var altShippingQuery = {
                statement: 'INSERT INTO AltShippingAddress SET ?',
                params: {
                    stripeId: stripeId,
                    name: shipping.name,
                    company: shipping.company,
                    street1: shipping.address.line1,
                    street2: shipping.address.line2,
                    street3: null,
                    city: shipping.address.city,
                    state: shipping.address.state,
                    postalCode: shipping.address.postal_code,
                    country: shipping.address.country
                }
            };

            dbUtils.query(dbConnPool, altShippingQuery, function(err, result) {
                if (err) {
                    return callback(err, null);
                }
                else {
                    var newAltShippingAddr = altShippingQuery.params;
                    newAltShippingAddr.id = result.insertId;

                    log.info('Added/Updated AltShippingAddress', newAltShippingAddr, reqIP);

                    return callback (null, newAltShippingAddr);
                }
            });
        }
    },

    update: function (req, res, dbConnPool, callback) {
        var item = req.body.item;
        var data = req.body.data;
        var customerId = req.user.stId;
        var payload;

        switch (item) {
            case 'email':
                payload = {email: data};
                break;
            case 'shipping':
                payload = {shipping: data};
                var tax = calculateTaxPercentage(data.address.state);
                payload.metadata = {
                        taxRate: tax.rate,
                        taxDesc: tax.desc
                    };
                break;
            case 'source':
                payload = {source: data};
                break;
            case 'metadata':
                payload = {metadata: data};
                break;
            default:
                return callback({
                    status: 400,
                    msg: {
                        simplified: 'incorrect_parameter',
                        detailed: 'customerCtrl.update() -- item value: ' + item + ' does not match any options'
                    }
                }, null);
                break;
        }

        stripe.customers.update(customerId, payload, function(err, customer) {
            if (err) {
                console.log(err);
                return callback({
                    status: 500,
                    type: 'stripe',
                    msg: {
                        simplified: 'server_error',
                        detailed: err
                    }
                }, null);
            }
            else {
                log.info('Updated customer', {customerId: customerId, item: item, data: data}, 'localhost');

                // Update customer's subscription tax rate because province to ship to has changed
                if (item === 'shipping') {
                    if (typeof customer.subscriptions.data[0] !== 'undefined') {
                        stripe.customers.updateSubscription(
                            customerId,
                            customer.subscriptions.data[0].id,
                            {tax_percent: tax.rate},
                            function(err, subscription) {
                                if (err) {
                                    console.log(err);
                                    return callback({
                                        status: 500,
                                        type: 'stripe',
                                        msg: {
                                            simplified: 'server_error',
                                            detailed: err
                                        }
                                    }, null);
                                }
                                else {
                                    return callback(false, customer);
                                }
                        });
                    }
                }
                else if ( (item === 'source') && (customer.sources.data.length > 0) ) {
                    var sourceInsertQuery = {
                        statement: 'INSERT INTO Source SET ?',
                        params: {
                            stripeId: customer.id,
                            sourceId: customer.sources.data[0].id,
                            brand: customer.sources.data[0].brand,
                            country: customer.sources.data[0].country,
                            lastFour: customer.sources.data[0].last4
                        }
                    };

                    var updateCustomerQuery = {
                        statement: 'UPDATE Customer SET defaultSource=? WHERE stripeId=?',
                        params: [
                            customer.default_source,
                            customer.id
                        ]
                    };

                    // Update internal Source table
                    dbUtils.query(dbConnPool, sourceInsertQuery, function (err, rows) {
                        if (err) {
                            return callback(err, null);
                        }
                        else {
                            log.info('Added source on internal DB', sourceInsertQuery.params, req.connection.remoteAddress);
                        }
                    });

                    // Update internal Customer table
                    dbUtils.query(dbConnPool, updateCustomerQuery, function(err, rows) {
                    });

                    return callback(false, customer);
                }
                else {
                    return callback(false, customer);
                }
            }
        });
    }
};


function calculateTaxPercentage(province) {
    var taxPercentage = 0;
    var taxDesc = '';
    switch(province) {
        case 'AB':
            taxPercentage = 5;
            taxDesc = 'GST 5%';
            break;
        case 'BC':
            taxPercentage = 12;
            taxDesc = 'GST + PST (5% + 7%)';
            break;
        case 'MB':
            taxPercentage = 13;
            taxDesc = 'GST + PST (5% + 8%)';
            break;
        case 'NB':
            taxPercentage = 13;
            taxDesc = 'HST 13%';
            break;
        case 'NL':
            taxDesc = 'HST 13%';
            taxPercentage = 13;
            break;
        case 'NS':
            taxDesc = 'HST 15%';
            taxPercentage = 15;
            break;
        case 'NT':
            taxDesc = 'GST 5%';
            taxPercentage = 5;
            break;
        case 'NU':
            taxDesc = 'GST 5%';
            taxPercentage = 5;
            break;
        case 'ON':
            taxDesc = 'HST 13%';
            taxPercentage = 13;
            break;
        case 'PE':
            taxDesc = 'HST 14%';
            taxPercentage = 14;
            break;
        case 'QC':
            taxDesc = 'GST + QST (5% + 9.975%)';
            taxPercentage = 14.98;
            break;
        case 'SK':
            taxDesc = 'GST + PST (5% + 10%)';
            taxPercentage = 10;
            break;
        case 'YT':
            taxDesc = 'GST 5%';
            taxPercentage = 5;
            break;
        default:
            taxDesc = '';
            taxPercentage = 0;
            break;
    }

    return {rate: taxPercentage, desc: taxDesc};

}

module.exports = new customerCtrl();