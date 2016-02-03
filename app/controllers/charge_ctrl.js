'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var dbUtils = require('../utils/db_utils');

var planCtrl = require('./plan_ctrl');
var couponCtrl = require('./coupon_ctrl');

var productCtrl = require('./product_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var chargeCtrl = function() {};

chargeCtrl.prototype = {

    oneTimeCharge: function (dbConnPool, customer, altShipping, cart, metadata, reqIP, callback) {

// TODO: ADD SHIPPING RATE FOR FUTURE CUSTOMERS OUTSIDE OF CANADA AND LOWER 48 STATES
        var shippingCost = 0;

        var chargeCurrency = 'CAD';
        if (customer.country === 'US') {
            chargeCurrency = 'USD';
        }

        var taxRate = 0;
        var taxDesc = '';

        if (customer.taxRate !== null) {
            taxRate = customer.taxRate;
        }
        if (customer.taxDesc !== null) {
            taxDesc = customer.taxDesc;
        }

        var shipping = null;
        if (altShipping) {
            shipping = altShipping;
        }
        else {
            shipping = {
                name: customer.name,
                address: {
                    line1: customer.street1,
                    line2: customer.street2,
                    city: customer.city,
                    state: customer.state,
                    postal_code: customer.postalCode,
                    country: customer.country
                }
            }
        }

        var chargePayload = {
            customer: customer.stripeId,
            shipping: shipping,
            currency: chargeCurrency,
            metadata: metadata
        };

        // Link all charge metadata into single string (separation was required to accomodate Stripe restrictions)
        var metadataString = '';
        for (var property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                metadataString += metadata[property];
            }
        }

        var productIds = [];

        for (var i = 0; i < cart.length; i++) {
            productIds.push(cart[i].id);
        }

        productCtrl.getByIdList(dbConnPool, [productIds], function(err, products) {
            if (products) {

                var amount = 0.0;

                var shipmentItems = [];

                // Tabulate subtotal of products and add to ShipmentItems
                for (var i = 0; i < products.length; i++) {
                    for (var j = 0; j < cart.length; j++) {
                        if (products[i].id === cart[j].id) {

                            var price = 0;
                            if (chargeCurrency === 'USD') {
                                price = products[i].usPrice;
                            }
                            else {
                                price = products[i].cadPrice;
                            }

                            amount += price * cart[j].quantity;

                            shipmentItems.push({
                                product_id: products[i].id,
                                quantity: cart[j].quantity,
                                pricePaid: price
                            });

                        }
                    }
                }

                amount += shippingCost;

                amount += taxRate * (amount);

                chargePayload.amount = amount;

                var now = new Date();

                // Create Shipment Obj
                var shipmentQuery = {
                    statement: 'INSERT INTO Shipment SET ?',
                    params: {
                        stripeCustomerId: customer.id,
                        status: 'pending_charge',
                        isSubscriptionBox: false,
                        creationDate: now.getUTCDate(),
                        pkgWeight: 0,
                        pkgLength: 0,
                        pkgWidth: 0,
                        pkgHeight: 0,
                        shippingRequired: true
                    }
                };

                dbUtils.query(dbConnPool, shipmentQuery, function(err, rows) {
                    var shipmentId = rows.insertId;

                    // Append shipmentId
                    for (var i = 0; i < shipmentItems.length; i++) {
                        shipmentItems[i].shipmentId = shipmentId;
                    }

                    var shipmentItemsQuery = {
                        statement: 'INSERT INTO ShipmentItem SET ?',
                        params: shipmentItems
                    };

                    // Async insert ShipmentItems relating to this Shipment
                    dbUtils.query(dbConnPool, shipmentItemsQuery, function(err, result) {});

                    // Charge the customer and update the shipment
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

                            var shipmentUpdateQuery = {
                                statement: 'UPDATE Shipment SET chargeId = ?, WHERE id = ?',
                                params: [charge.id, shipmentId]
                            };

                            var chargeInsertQuery = {
                                statement: 'INSERT INTO Charge SET = ?',
                                params: {
                                    id: charge.id,
                                    created: (new Date(charge.created * 1000)).getUTCDate(),
                                    amount: charge.amount,
                                    currency: charge.currency,
                                    customerId: charge.customer,
                                    failureCode: charge.failureCode,
                                    failureMessage: charge.failureMessage,
                                    invoiceId: charge.invoice,
                                    paid: charge.paid,
                                    serializedChargeData: metadataString
                                }
                            };

                            // Update Shipment with chargeId
                            dbUtils.query(dbConnPool, shipmentUpdateQuery, function(err, result) {});

                            // Save charge information
                            dbUtils.query(dbConnPool, chargeInsertQuery, function(err, result) {});

                            return callback(charge);
                        }
                    });

                });

            }
            else {
                return callback({
                    status: 400,
                    type: 'app',
                    msg: {
                        simplified: 'bad_request',
                        detailed: 'No products returned in Charge.create'
                    }
                }, null);
            }

        });

        /*

        // Retrieve plan to get cost of purchase
        planCtrl.get(planId, function(err, plan) {
            if (err) {
                return callback(err, null);
            }
            else {
                var chargePayload = {
                    currency: plan.currency,
                    customer: customer.id,
                    shipping: shipping,
                    metadata: {
                        plan_id: planId
                    }
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
                                totalTax = parseFloat( ((quantity * plan.amount * taxRate) / 10000).toFixed(2) );
                                chargeAmount = ( (quantity * plan.amount/100) + totalTax ) * 100;

                                chargePayload.amount = chargeAmount;

                                chargePayload.description = quantity + 'x ' + plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
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
                                discount = parseFloat((quantity * plan.amount/100 * (coupon.percent_off/100)).toFixed(2));
                            }
                            else {
                                discount = coupon.amount_off/100;
                            }

                            // Plan - Discount + ( (Plan - Discount) * tax) --- Converted to integer (Ex: 19.99 = 1999)
                            var revPlanAmt = parseFloat( ((quantity*plan.amount/100) - discount).toFixed(2) );

                            // Prevent negative totals
                            if (revPlanAmt < 0) {
                                revPlanAmt = 0;
                            }

                            totalTax = parseFloat( (revPlanAmt * (taxRate/100)).toFixed(2) );
                            chargeAmount = ( (revPlanAmt) + totalTax ) * 100;

                            chargePayload.amount = chargeAmount;

                            chargePayload.description = quantity + 'x ' + plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
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
                    totalTax = parseFloat( ((quantity * plan.amount * taxRate) / 10000).toFixed(2) );
                    chargeAmount = ( (quantity*plan.amount/100) + totalTax ) * 100;

                    chargePayload.amount = chargeAmount;

                    chargePayload.description = quantity + 'x ' + plan.name + ' : $' + (plan.amount/100).toFixed(2) + ' /// ' +
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

        */
    }

};

module.exports = new chargeCtrl();