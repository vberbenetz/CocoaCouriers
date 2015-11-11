'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var subscriptionCtrl = require('./subscription_ctrl');
var invoiceCtrl = require('./invoice_ctrl');
var userCtrl = require('./user_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var customerCtrl = function() {};

customerCtrl.prototype = {

    get: function (req, res, callback) {
        var customerId = req.user.stripeId;

        stripe.customers.retrieve(customerId, function(err, customer) {
            if(err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(customer);
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

        var size = req.body.size;
        var material = req.body.material;
        var brand = req.body.brand;
        var boxType = req.body.BOX_TYPE;

        var payload = {
            email: email,
            shipping: shipping,
            source: source,
            metadata: {
                size: size,
                material: material,
                brand: brand,
                BOX_TYPE: boxType,
                taxRate: tax.rate,
                taxDesc: tax.desc
            }
        };

        stripe.customers.create(payload, function(err, customer) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {

                // Update user with stripe customer Id
                userCtrl.updateCustomerId(dbConnPool, function (err, result) {
                    if (err) {
                        errorHandler.appErrors(res, err, customer, req.connection.remoteAddress);
                    }
                    else {
                        log.info('Created customer', {customer: customer}, req.connection.remoteAddress);

                        // Create invoice tax line
                        invoiceCtrl.addTaxItem(customer.id, planId, tax, res, function(invoiceItem) {
                            log.info('Added sales tax to customer invoice', {customer: customer.id, invoiceItem: invoiceItem}, req.connection.remoteAddress);

                            req.body.customer = customer.id;

                            // Subscribe user to a plan
                            subscriptionCtrl.create(req, res, function(subscription) {
                                if (!err) {
                                    customer.subscriptions.data.push(subscription);
                                }
                                return callback(customer);
                            });

                        });
                    }

                });

            }
        })
    },

    update: function (req, res, callback) {
        var customerId = req.query.id;
        var item = req.body.item;
        var data = req.body.data;
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
                errorHandler.appErrors(res, 'Unknown item: ' + item, {object: 'customerCtrl.update()', httpErrorCode: 404}, req.connection.remoteAddress);
                break;
        }

        stripe.customers.update(customerId, payload, function(err, customer) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Updated customer', {customerId: customerId, item: item, data: data}, req.connection.remoteAddress);
                return callback(customer);
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