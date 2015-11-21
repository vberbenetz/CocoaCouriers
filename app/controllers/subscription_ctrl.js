'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var helpers = require('../utils/helpers');
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
            invoiceCtrl.addTaxItem(customer.id, payload.plan, tax, helpers.isCoolDownPeriod(), res, function(err, invoiceItem) {
                if (err) {
                    return callback(err, null);
                }

                log.info('Added sales tax to customer invoice', {customer: customer.id, invoiceItem: invoiceItem}, req.connection.remoteAddress);

                // Check if subscription currently falls within cool-down period.
                // Do not bill user until next cycle if currently in cool-down
                if (helpers.isCoolDownPeriod()) {
                    payload.trial_end = helpers.getNextBillingDate(customerId);
                    payload.metadata = { cool_down: true }
                }

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

                        // Adjust billing period to fall on same as within config file
                        // -----------------------------------------------------------
                        // User registered within cool-down period and has already had their billing period synced with the config
                        if (subscription.trial_end != null) {
                            return callback(false, subscription);
                        }
                        else {
                            payload = {
                                trial_end: helpers.getNextBillingDate(customerId),
                                prorate: false
                            };

                            stripe.customers.updateSubscription(customerId, subscription.id, payload, function(err, updatedSubscription) {
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

                                return callback(false, updatedSubscription);
                            });
                        }
                    }
                });

            });

        });

    },


    update: function (req, res, callback) {

        var customerId = req.user.stId;
        var newPlan = req.body.new_plan;
        var payload = {
            plan: newPlan,
            prorate: false,
            trial_end: helpers.getNextBillingDate(customerId)
        };

        // Get customer which needs to have their subscription updated
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
            else {
                if (typeof customer.subscriptions.data[0] !== 'undefined') {
                    var subscriptionId = customer.subscriptions.data[0].id;

                    // Update the customer's subscription to the new plan
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
                    });
                }
                else {
                    console.log('subscriptionCtrl.update() retrieving customer does not have a subscription.');
                    return callback({
                        status: 500,
                        type: 'app',
                        msg: {
                            simplified: 'server_error',
                            detailed: 'subscriptionCtrl.update() retrieving customer does not have a subscription.'
                        }
                    }, null);
                }
            }
        });

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