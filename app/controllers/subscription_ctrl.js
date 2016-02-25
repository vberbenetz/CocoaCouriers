'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var helpers = require('../utils/helpers');

var dbUtils = require('../utils/db_utils');

var stripe = require('stripe')(
    configPriv.sKey
);


/* NEW VERSION
 -----------------------------------------
var subscriptionCtrl = function() {};

subscriptionCtrl.prototype = {

    get: function (stripeId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT s.*, p.* FROM Subscription s INNER JOIN Plan p ON s.plan_id=p.id WHERE s.stripeId = ?',
            params: [stripeId]
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

    create: function (customer, userCountry, planId, altShippingId, couponId, dbConnPool, reqIP, callback) {

        var payload = {};

        // Attach coupon code if supplied
        if ( (typeof couponId !== 'undefined') && (couponId !== null) && (couponId.length !== 0) && (couponId !== '') ) {
            payload.coupon = couponId;
        }

        // Switch plan to currency in which card originates from
        payload.plan = helpers.sourceCountryPlanId(planId, userCountry);

        var tax = {
            rate: parseFloat(customer.metadata.taxRate),
            desc: customer.metadata.taxDesc
        };

        // Attach tax rate to payload
        payload.tax_percent = tax.rate;

        // Check if subscription currently falls within cool-down period.
        // Do not bill user until next cycle if currently in cool-down
        if (helpers.isCoolDownPeriod()) {
            payload.trial_end = helpers.getNextBillingDate(1);
        }

        // Create subscription
        stripe.customers.createSubscription(customer.stripeId, payload, function(subErr, subscription) {
            if (subErr) {

                // Add card issue tag to customer
                var cardErrorCode = 'processing_error';
                if (subErr.rawType === 'card_error') {
                    cardErrorCode = subErr.code;
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
            }
            else {
                log.info("Created new subscription", subscription, reqIP);

                var subscriptionInsertQuery = {
                    statement: 'INSERT INTO Subscription SET ?',
                    params: {
                        stripeId: customer.stripeId,
                        subscriptionId: subscription.id,
                        taxPercent: subscription.tax_percent,
                        plan_id: subscription.plan.id
                    }
                };

                if (altShippingId) {
                    subscriptionInsertQuery.params.altShippingAddressId = altShippingId;
                }

                if (subscription.discount) {
                    subscriptionInsertQuery.params.discountId = subscription.discount.coupon.id;
                }

                // Add subscription to local db
                dbUtils.query(dbConnPool, subscriptionInsertQuery, function(err, result) {});

                // Adjust billing period to fall on same as within config file
                // -----------------------------------------------------------
                // User registered within cool-down period and has already had their billing period synced with the config
                if (subscription.trial_end != null) {
                    return callback(false, subscription);
                }
                else {
                    payload = {
                        trial_end: helpers.getNextBillingDate(subscription.plan.interval_count),
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

    },

    update: function (customerId, newPlanId, reqIP, callback) {

        var subscriptionCtrlObj = this;

        var payload = {
            prorate: false
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

                // Check if customer has a valid payment source attached
                if (typeof customer.sources.data[0].country === 'undefined') {
                    return callback({
                        status: 500,
                        type: 'app',
                        msg: {
                            simplified: 'server_error',
                            detailed: 'subscriptionCtrl.create() customer has no source'
                        }
                    }, null);
                }

                // Switch plan to currency in which card originates from
                payload.plan = helpers.sourceCountryPlanId(newPlanId, customer.sources.data[0].country);

                // Check if customer has a recurring subscription.
                // If not, subscribe them to the chosen plan
                var recurringSubscription = helpers.filterRecurringSubscriptions(customer.subscriptions);
                if (recurringSubscription === null) {
                    subscriptionCtrlObj.create(customerId, newPlanId, null, reqIP, function(err, newSubscription) {
                        return callback(err, newSubscription);
                    });
                }

                // Switch plan to start after the current plan that is paid for expires
                else {
                    payload.trial_end = recurringSubscription.current_period_end;

                    // Update the customer's subscription to the new plan
                    stripe.customers.updateSubscription(customerId, recurringSubscription.id, payload, function(err, subscription) {
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
                            log.info("Updated subscription", subscription, reqIP);
                            return callback(false, subscription);
                        }
                    });
                }

            }
        });

    },


    cancel: function (customerId, subscriptionId, reqIP, callback) {

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
                log.info("Cancelled subscription", {customerId: customerId, subscriptionId: subscriptionId}, reqIP);
                return callback(false, confirmation);
            }
        })
    }
};

*/

var subscriptionCtrl = function() {};

subscriptionCtrl.prototype = {

    get: function (customerId, subscriptionId, callback) {

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

    create: function (customerId, planId, couponId, reqIP, callback) {

        // Verify plan has been included in request
        if (typeof planId === 'undefined') {
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

        var payload = {};

        // Attach coupon code if supplied
        if ( (typeof couponId !== 'undefined') && (couponId !== null) && (couponId.length !== 0) && (couponId !== '') ) {
            payload.coupon = couponId;
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

            // Check if customer has a valid payment source attached
            if (typeof customer.sources.data[0].country === 'undefined') {
                return callback({
                    status: 402,
                    type: 'app',
                    msg: {
                        simplified: 'no_source',
                        detailed: 'subscriptionCtrl.create() customer has no source'
                    }
                }, null);
            }

            // Switch plan to currency in which card originates from
            payload.plan = helpers.sourceCountryPlanId(planId, customer.sources.data[0].country);

            var tax = {
                rate: parseFloat(customer.metadata.taxRate),
                desc: customer.metadata.taxDesc
            };

            // Attach tax rate to payload
            payload.tax_percent = tax.rate;

            // Check if subscription currently falls within cool-down period.
            // Do not bill user until next cycle if currently in cool-down
            if (helpers.isCoolDownPeriod()) {
                payload.trial_end = helpers.getNextBillingDate(1);
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

                    return callback({
                        status: 500,
                        type: 'stripe',
                        msg: {
                            simplified: 'server_error',
                            detailed: subErr
                        },
                        cardErrorCode: cardErrorCode
                    }, null);
                }
                else {
                    log.info("Created new subscription", subscription, reqIP);

                    // Adjust billing period to fall on same as within config file
                    // -----------------------------------------------------------
                    // User registered within cool-down period and has already had their billing period synced with the config
                    if (subscription.trial_end != null) {
                        return callback(false, subscription);
                    }
                    else {
                        payload = {
                            trial_end: helpers.getNextBillingDate(subscription.plan.interval_count),
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

    },

    update: function (customerId, newPlanId, reqIP, callback) {

        var subscriptionCtrlObj = this;

        var payload = {
            prorate: false
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

                // Check if customer has a valid payment source attached
                if (typeof customer.sources.data[0].country === 'undefined') {
                    return callback({
                        status: 500,
                        type: 'app',
                        msg: {
                            simplified: 'server_error',
                            detailed: 'subscriptionCtrl.create() customer has no source'
                        }
                    }, null);
                }

                // Switch plan to currency in which card originates from
                payload.plan = helpers.sourceCountryPlanId(newPlanId, customer.sources.data[0].country);

                // Check if customer has a recurring subscription.
                // If not, subscribe them to the chosen plan
                var recurringSubscription = helpers.filterRecurringSubscriptions(customer.subscriptions);
                if (recurringSubscription === null) {
                    subscriptionCtrlObj.create(customerId, newPlanId, null, reqIP, function(err, newSubscription) {
                        return callback(err, newSubscription);
                    });
                }

                // Switch plan to start after the current plan that is paid for expires
                else {
                    payload.trial_end = recurringSubscription.current_period_end;

                    // Update the customer's subscription to the new plan
                    stripe.customers.updateSubscription(customerId, recurringSubscription.id, payload, function(err, subscription) {
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
                            log.info("Updated subscription", subscription, reqIP);
                            return callback(false, subscription);
                        }
                    });
                }

            }
        });

    },


    cancel: function (customerId, subscriptionId, reqIP, callback) {

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
                log.info("Cancelled subscription", {customerId: customerId, subscriptionId: subscriptionId}, reqIP);
                return callback(false, confirmation);
            }
        })
    }
};


module.exports = new subscriptionCtrl();