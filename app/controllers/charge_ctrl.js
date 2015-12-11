'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var planCtrl = require('./plan_ctrl');
var couponCtrl = require('./coupon_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var chargeCtrl = function() {};

chargeCtrl.prototype = {

    oneTimeCharge: function (customer, shipping, planId, couponId, reqIP, callback) {

// TODO: ADD SHIPPING RATE FOR FUTURE CUSTOMERS OUTSIDE OF CANADA AND LOWER 48 STATES

        if (customer.sources.data[0].country === 'US') {
            var splitPlan = planId.split('_');
            var tempPlan = splitPlan[0];
            tempPlan += '_usd';
            for (var i = 2; i < splitPlan.length; i++) {
                tempPlan += '_' + splitPlan[i];
            }
            planId = tempPlan;
        }

        // Retrieve plan to get cost of purchase
        planCtrl.get(planId, function(err, plan) {
            if (err) {
                return callback(err, null);
            }
            else {
                var chargePayload = {
                    currency: plan.currency,
                    customer: customer.id,
                    shipping: shipping
                };
                var chargeAmount = 0;
                var totalTax = 0;

                var taxRate = 0;
                var taxDesc = '';
                if (typeof customer.metadata.taxRate !== 'undefined') {
                    taxRate = customer.metadata.taxRate;
                }
                if (typeof customer.metadata.taxDesc !== 'undefined') {
                    taxDesc = customer.metadata.taxDesc;
                }

                // Retrieve coupon
                if ( (typeof couponId !== 'undefined') && (couponId !== null) && (couponId.length !== 0) && (couponId !== '') ) {
                    couponCtrl.get(couponId, function(err, coupon) {

                        if (err) {

                            // Coupon doesn't exist
                            if (err.detailed.raw.statusCode === 404) {

                                // Plan + (plan * tax) --- Converted to integer (Ex: 19.99 = 1999)
                                totalTax = parseFloat( ((plan.amount * taxRate) / 10000).toFixed(2) );
                                chargeAmount = ( (plan.amount/100) + totalTax ) * 100;

                                chargePayload.amount = chargeAmount;

                                chargePayload.description = plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
                                        'Sales Tax ' + taxDesc + ' : $' + totalTax.toFixed(2);

                                stripe.charges.create(chargePayload, function(err, charge) {
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
                                        log.info("Created new charge", charge, reqIP);
                                        return callback(false, charge);
                                    }
                                });

                            }
                            else {
                                return callback (err, null);
                            }

                        }

                        // Coupon exists
                        else {
                            var discount = 0;

                            if (coupon.percent_off != null) {
                                // Plan - (Plan * Coupon_Percentage)
                                discount = parseFloat((plan.amount/100 * (coupon.percent_off/100)).toFixed(2));
                            }
                            else {
                                discount = coupon.amount_off/100;
                            }

                            // Plan - Discount + ( (Plan - Discount) * tax) --- Converted to integer (Ex: 19.99 = 1999)
                            var revPlanAmt = parseFloat( ((plan.amount/100) - discount).toFixed(2) );
                            totalTax = parseFloat( (revPlanAmt * (taxRate/100)).toFixed(2) );
                            chargeAmount = ( (revPlanAmt) + totalTax ) * 100;

                            chargePayload.amount = chargeAmount;

                            chargePayload.description = plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
                                'Discount : -$' + discount.toFixed(2) + ' /// ' +
                                'Sales Tax ' + taxDesc + ' : $' + totalTax.toFixed(2);

                            stripe.charges.create(chargePayload, function(err, charge) {
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
                                    log.info("Created new charge", charge, reqIP);
                                    return callback(false, charge);
                                }
                            });
                        }


                    });
                }

                else {
                    // Plan + (plan * tax) --- Converted to integer (Ex: 19.99 = 1999)
                    totalTax = parseFloat( ((plan.amount * taxRate) / 10000).toFixed(2) );
                    chargeAmount = ( (plan.amount/100) + totalTax ) * 100;

                    chargePayload.amount = chargeAmount;

                    chargePayload.description = plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
                        'Sales Tax ' + taxDesc + ' : $' + totalTax.toFixed(2);

                    stripe.charges.create(chargePayload, function(err, charge) {
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
                            log.info("Created new charge", charge, reqIP);
                            return callback(false, charge);
                        }
                    });

                }
            }
        });

    }

};

module.exports = new chargeCtrl();