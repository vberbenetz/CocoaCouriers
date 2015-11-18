'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var subscriptionCtrl = require('./subscription_ctrl');
var invoiceCtrl = require('./invoice_ctrl');
var userCtrl = require('./user_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var customerCtrl = function() {};

customerCtrl.prototype = {

    get: function (req, res, callback) {
        var customerId = req.user.stId;

        stripe.customers.retrieve(customerId, function(err, customer) {
            if(err) {
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
        })
    },

    create: function (req, res, dbConnPool, callback) {
        var shipping = {
            name: req.body.name,
            address: req.body.address
        };

        var email = req.body.email;
        var source = req.body.source;
        var planId = req.body.plan;
        var tax = calculateTaxPercentage(shipping.address.state);

        var payload = {
            email: email,
            shipping: shipping,
            source: source,
            metadata: {
                taxRate: tax.rate,
                taxDesc: tax.desc
            }
        };

        stripe.customers.create(payload, function(stripeErr, customer) {
            if (stripeErr) {

                req.logout();

                req.session.destroy(function(err) {

                    if (!err) {
                        // Delete newly created user for user to retry request
                        userCtrl.removeUser(email, dbConnPool, function(err, result) {
                            if (err) {
                                log.error(err);
                            }

                            return callback({
                                status: 500,
                                type: 'stripe',
                                msg: {
                                    simplified: 'server_error',
                                    detailed: stripeErr
                                }
                            }, null);
                        });
                    }

                });

            }
            else {

                // Update user with stripe customer Id
                userCtrl.updateCustomerId(email, customer.id, dbConnPool, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    else {
                        log.info('Created customer', {customer: customer}, req.connection.remoteAddress);

                        // Create invoice tax line
                        invoiceCtrl.addTaxItem(customer.id, planId, tax, res, function(err, invoiceItem) {
                            if (err) {
                                return callback(err, null);
                            }

                            log.info('Added sales tax to customer invoice', {customer: customer.id, invoiceItem: invoiceItem}, req.connection.remoteAddress);

                            req.body.customer = customer.id;

                            // Subscribe user to a plan
                            subscriptionCtrl.create(req, res, function(err, subscription) {
                                if (err) {
                                    return callback(err, null);
                                }

                                customer.subscriptions.data.push(subscription);

                                return callback(false, customer);
                            });

                        });
                    }

                });

            }
        })
    },

    update: function (req, res, callback) {
        var item = req.body.item;
        var data = req.body.data;
        var customerId = req.body.customerId;
        var payload;

        switch (item) {
            case 'coupon':
                payload = {coupon: data};
                break;
            case 'email':
                payload = {email: data};
                break;
            case 'shipping':
                payload = {shipping: data};
                break;
            case 'source':
                payload = {source: data};
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
                return callback(false, customer);
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
            taxDesc = 'GST -- (5%)';
            break;
        case 'BC':
            taxPercentage = 12;
            taxDesc = 'GST / PST -- (5% + 7%)';
            break;
        case 'MB':
            taxPercentage = 13;
            taxDesc = 'GST / PST -- (5% + 8%)';
            break;
        case 'NB':
            taxPercentage = 13;
            taxDesc = 'HST -- (5% + 8%)';
            break;
        case 'NL':
            taxDesc = 'HST -- (5% + 8%)';
            taxPercentage = 13;
            break;
        case 'NS':
            taxDesc = 'HST -- (5% + 10%)';
            taxPercentage = 15;
            break;
        case 'NT':
            taxDesc = 'GST -- (5%)';
            taxPercentage = 5;
            break;
        case 'NU':
            taxDesc = 'GST -- (5%)';
            taxPercentage = 5;
            break;
        case 'ON':
            taxDesc = 'HST -- (5% + 8%)';
            taxPercentage = 13;
            break;
        case 'PE':
            taxDesc = 'HST -- (5% + 9%)';
            taxPercentage = 14;
            break;
        case 'QC':
            taxDesc = 'GST / QST -- (5% + 9.975%)';
            taxPercentage = 14.975;
            break;
        case 'SK':
            taxDesc = 'GST + PST -- (5% + 10%)';
            taxPercentage = 10;
            break;
        case 'YT':
            taxDesc = 'GST -- (5%)';
            taxPercentage = 5;
            break;
        default:
            break;
    }

    return {rate: taxPercentage, desc: taxDesc};

}

module.exports = new customerCtrl();