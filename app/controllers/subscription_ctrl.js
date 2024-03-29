'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var helpers = require('../utils/helpers');
var couponCtrl = require('./coupon_ctrl');

var dbUtils = require('../utils/db_utils');

var stripe = require('stripe')(
    configPriv.sKey
);


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

    getAltShippingAddress: function (subscriptionId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM AltShippingAddress WHERE id = (SELECT altShippingAddressId FROM Subscription WHERE subscriptionId = ?)',
            params: [subscriptionId]
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

    create: function (customer, userCountry, planId, altShipping, couponId, orderMessage, dbConnPool, emailUtils, reqIP, callback) {

        var payload = {
            metadata: {}
        };

        // Attach altShippingId
        if (altShipping) {
            payload.metadata.altShippingId = altShipping.id
        }

        // Attach order message for package
        if (orderMessage) {
            payload.metadata.orderMessage = orderMessage;
        }

        // Apply coupon
        couponCtrl.verifySubscriptionCoupon(couponId, planId, userCountry, function(err, coupon) {

            if (coupon) {
                payload.coupon = couponId;
            }

            // Switch plan to currency in which card originates from
            payload.plan = helpers.sourceCountryPlanId(planId, userCountry);

            var tax = {
                rate: parseInt(customer.taxRate),
                desc: customer.taxDesc
            };

            // Attach tax rate to payload
            payload.tax_percent = tax.rate;

            // Check if subscription currently falls within cool-down period.
            // Do not bill user until next cycle if currently in cool-down
            if (helpers.isCoolDownPeriod()) {
                payload.trial_end = helpers.getNextBillingDate(1);
            }

            // Check if currently under a vacation period
            // Do not bill until after vacation period has ended.
            if (helpers.isVacationPeriod()) {
                payload.trial_end = helpers.getNextBillingDateAfterVacation();
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

                    // Statement has on duplicate IGNORE because the Invoice.payment_success webhook might trigger before this query
                    var subscriptionInsertQuery = {
                        statement: 'INSERT INTO Subscription SET ? ON DUPLICATE KEY UPDATE stripeId=stripeId',
                        params: {
                            stripeId: customer.stripeId,
                            subscriptionId: subscription.id,
                            taxPercent: subscription.tax_percent,
                            plan_id: subscription.plan.id,
                            lastSubscriptionPackageId: 0
                        }
                    };

                    if (altShipping) {
                        subscriptionInsertQuery.params.altShippingAddressId = altShipping.id;
                    }

                    if ( (subscription.discount) && (subscription.discount.coupon) ) {
                        subscriptionInsertQuery.params.discountId = subscription.discount.coupon.id;
                    }

                    emailUtils.sendSubscriptionRegistration(customer.email, subscription.plan, function(err, result) {
                        if (err) {
                            log.error('Failed to send subscription purchase email to customer', {stId: customer.stripeId}, reqIP);
                        }
                    });

                    // Add subscription to local db
                    dbUtils.query(dbConnPool, subscriptionInsertQuery, function(err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        else {

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

                                stripe.customers.updateSubscription(customer.stripeId, subscription.id, payload, function(err, updatedSubscription) {
                                    if (err) {
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
                                        return callback(false, updatedSubscription);
                                    }
                                });
                            }
                        }
                    });

                }
            });

        });

    },

    update: function (customerId, planId, reqIP, dbConnPool, callback) {

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
                else {

                    if (customer.subscriptions.data[0]) {

                        // Switch plan to currency in which card originates from
                        payload.plan = helpers.sourceCountryPlanId(planId, customer.sources.data[0].country);

                        payload.trial_end = customer.subscriptions.data[0].current_period_end;

                        // Update the customer's subscription to the new plan
                        stripe.customers.updateSubscription(customerId, customer.subscriptions.data[0].id, payload, function(err, subscription) {
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
                                log.info("Updated subscription on stripe", subscription, reqIP);

                                var subUpdateQuery = {
                                    statement: 'UPDATE Subscription SET ? WHERE ? AND ?',
                                    params: [
                                        {
                                            plan_id: payload.plan
                                        },
                                        {
                                            stripeId: customerId
                                        },
                                        {
                                            subscriptionId: subscription.id
                                        }
                                    ]
                                };

                                dbUtils.query(dbConnPool, subUpdateQuery, function(err, result) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    else {
                                        log.info("Updated subscription locally", subscription, reqIP);
                                        return callback(false, subscription);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        return callback(true, null);
                    }

                }

            }
        });

    },

    updateAltShippingAddress: function(stripeCustomerId, subscriptionId, altShippingAddressId, dbConnPool, callback) {

        var subAddrUpdateQuery = {
            statement: 'UPDATE Subscription SET ? WHERE ? AND ?',
            params: [
                {
                    altShippingAddressId: altShippingAddressId
                },
                {
                    stripeId: stripeCustomerId
                },
                {
                    subscriptionId: subscriptionId
                }
            ]
        };

        dbUtils.query(dbConnPool, subAddrUpdateQuery, function(err, result) {
            if (err) {
                return callback(err, null);
            }
            else {

                // Update subscription metadata
                stripe.customers.updateSubscription(
                    stripeCustomerId,
                    subscriptionId,
                    {
                        metadata: {
                            altShippingId: altShippingAddressId.toString()
                        }
                    },
                    function (err, subscription) {
                        if (err) {
                            log.error('Could not update subscription altShippingAddr', {
                                stripeId: stripeCustomerId,
                                subscriptionId: subscriptionId,
                                altShippingAddrId: altShippingAddressId
                            }, null);
                        }
                    }
                );

                return callback(null, result);
            }
        });
    },

    cancel: function (customerId, subscriptionId, reqIP, dbConnPool, callback) {

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
                log.info("Cancelled subscription on stripe", {customerId: customerId, subscriptionId: subscriptionId}, reqIP);

                var subCancelQuery = {
                    statement: 'DELETE FROM Subscription WHERE ?',
                    params: {
                        subscriptionId: subscriptionId
                    }
                };

                dbUtils.query(dbConnPool, subCancelQuery, function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    else {
                        log.info("Cancelled subscription locally", subscriptionId, reqIP);
                        return callback(false, confirmation);
                    }
                });
            }
        })
    }
};


module.exports = new subscriptionCtrl();