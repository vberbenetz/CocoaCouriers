'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var invoiceCtrl = require('./invoice_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var subscriptionCtrl = function() {};

subscriptionCtrl.prototype = {

    get: function (req, res, callback) {

        var customerId = req.query.customerId;
        var subscriptionId = req.query.subscriptionId;

        stripe.customers.retrieveSubscription(customerId, subscriptionId, function(err, subscription) {
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
                return callback(false, subscription);
            }
        });
    },

    create: function (req, res, callback) {

        var customerId = req.user.stId;

        // Verify plan has been included in request
        if (typeof req.body.plan === 'undefined') {
            return callback({
                status: 400,
                type: 'app',
                no_logging: true,
                msg: {
                    simplified: 'Missing plan value',
                    detailed: 'subscriptionCtrl.create() no planId supplied'
                }
            }, null);
        }

        var payload = {
            plan: req.body.plan
        };

        // Attach coupon code if supplied
        if ( (typeof req.body.coupon !== 'undefined') && (req.body.coupon !== null) && (req.body.coupon.length !== 0) && (req.body.coupon !== '') ) {
            payload.coupon = req.body.coupon;
        }

        // Get customer data
        stripe.customers.retrieve(customerId, function(err, customer) {
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

            var tax = {
                rate: parseFloat(customer.metadata.taxRate),
                desc: customer.metadata.taxDesc
            };

            // Create invoice tax line
            invoiceCtrl.addTaxItem(customer.id, payload.plan, tax, res, function(err, invoiceItem) {
                if (err) {
                    return callback(err, null);
                }

                log.info('Added sales tax to customer invoice', {customer: customer.id, invoiceItem: invoiceItem}, req.connection.remoteAddress);

                // Create subscription
                stripe.customers.createSubscription(customerId, payload, function(subErr, subscription) {
                    if (subErr) {
                        console.log(subErr);

                        // Add card issue tag to customer
                        var cardErrorCode = 'processing_error';
                        if (subErr.rawType === 'card_error') {
                            cardErrorCode = subErr.code;
                        }

                        // Delete the tax item added above because subscription didn't go through
                        invoiceCtrl.removeItem(invoiceItem.id, res, function(invoiceErr, confimration) {
                            if (invoiceErr) {
                                console.log(invoiceErr);
                                return callback(invoiceErr, null);
                            }

                            return callback({
                                status: 500,
                                type: 'stripe',
                                msg: {
                                    simplified: 'server_error',
                                    detailed: subErr
                                },
                                cardErrorCode: cardErrorCode
                            }, null);

                        });

                    }
                    else {
                        log.info("Created new subscription", subscription, req.connection.remoteAddress);
                        return callback(false, subscription);
                    }
                });

            });

        });

    },


    update: function (req, res, callback) {

        var customerId = req.query.customerId;
        var subscriptionId = req.query.subscriptionId;
        var plan = req.query.planId;
        var payload = {
            plan: plan,
            prorate: false
        };

        stripe.customers.updateSubscription(customerId, subscriptionId, payload, function(err, subscription) {
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
                log.info("Updated subscription", subscription, req.connection.remoteAddress);
                return callback(false, subscription);
            }
        })
    },


    cancel: function (req, res, callback) {

        var customerId = req.query.customerId;
        var subscriptionId = req.query.subscriptionId;

        stripe.customers.cancelSubscription(customerId, subscriptionId, function(err, confirmation) {
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
                log.info("Cancelled subscription", {customerId: customerId, subscriptionId: subscriptionId}, req.connection.remoteAddress);
                return callback(false, confirmation);
            }
        })
    }
};

module.exports = new subscriptionCtrl();