'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var dbUtils = require('../utils/db_utils');

var planCtrl = require('./plan_ctrl');
var couponCtrl = require('./coupon_ctrl');

var productCtrl = require('./product_ctrl');

var helpers = require('../utils/helpers');

var stripe = require('stripe')(
    configPriv.sKey
);

var chargeCtrl = function() {};

chargeCtrl.prototype = {

    oneTimeCharge: function (customer, userCountry, source, altShipping, cart, metadata, couponId, orderMessage, dbConnPool, emailUtils, reqIP, callback) {

// TODO: ADD SHIPPING RATE FOR FUTURE CUSTOMERS OUTSIDE OF CANADA AND LOWER 48 STATES
        var chargedShipping = 0;

        var chargeCurrency = 'CAD';
        if ((userCountry) && (userCountry === 'US')) {
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
        var shippingCompany = null;
        var altShippingAddressId = null;
        if (altShipping) {
            shipping = helpers.formatStripeShipping(altShipping);
            shippingCompany = altShipping.company;
            altShippingAddressId = altShipping.id;
        }
        else {
            shipping = helpers.formatStripeShipping(customer);
            shippingCompany = customer.company;
        }

        var chargePayload = {
            customer: customer.stripeId,
            source: source,
            shipping: shipping,
            currency: chargeCurrency,
            metadata: metadata
        };

        if (altShipping) {
            chargePayload.metadata.altShippingId = altShipping.id
        }

        // Link all charge metadata into single string (separation was required to accommodate Stripe restrictions)
        var metadataString = '';
        for (var property in metadata) {
            if (metadata.hasOwnProperty(property)) {
                metadataString += metadata[property];
            }
        }

        // Add shipping company name to metadata
        chargePayload.metadata.shipping_company = shippingCompany;
        chargePayload.metadata.taxRate = taxRate;
        chargePayload.metadata.taxDesc = taxDesc;

        var productIds = [];

        for (var i = 0; i < cart.length; i++) {
            productIds.push(cart[i].id);
        }

        productCtrl.getByIdList(dbConnPool, [productIds], function(err, products) {
            if (products) {

                var amount = 0;

                var shipmentItems = [];
                var receiptProducts = [];

                // Default to 5oz for just packaging
                var shipmentWeight = 5;

                // Tabulate subtotal of products and add to ShipmentItems
                // Sum up total weight of box
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

                            amount += (price * cart[j].quantity);

                            shipmentItems.push([
                                products[i].id,
                                cart[j].quantity,
                                price
                            ]);

                            receiptProducts.push({
                                name: products[i].name,
                                quantity: cart[j].quantity,
                                price: price
                            });

                            shipmentWeight += products[i].weightImperial;
                        }
                    }
                }

                var subtotal = amount;

                chargedShipping = helpers.calculateShipping(shipping.address.state, shipping.address.country, subtotal);
                if (!chargedShipping) {
                    chargedShipping = 0;
                }

                amount += chargedShipping;

                /**
                 * Amount + Amount*Tax
                 *
                 * Example:
                 * All whole numbers (tax rate percentage is a whole number, amounts in cents)
                 *
                 * 1399 + Ceiling( (13 * 1399) / 100 )
                 * 1399 + Ceiling( (181.87) )
                 * 1399 + 182
                 * 1581
                 * $15.81
                 */
                var taxAmount = Math.ceil((taxRate * (amount)) / 100);
                amount += taxAmount;

                chargePayload.amount = amount;

                var now = new Date();

                // Create Shipment Obj
                /*
                var shipmentQuery = {
                    statement: 'INSERT INTO Shipment SET ?',
                    params: {
                        stripeCustomerId: customer.stripeId,
                        altShippingAddressId: altShippingAddressId,
                        status: 'pending_charge',
                        isSubscriptionBox: false,
                        creationDate: now,
                        pkgWeight: shipmentWeight,
                        pkgLength: 8.5,
                        pkgWidth: 8.5,
                        pkgHeight: 2,
                        shippingRequired: true,
                        shipmentCost: chargedShipping,
                        orderMessage: orderMessage
                    }
                };
                */
                var shipmentQuery = {
                    statement: 'INSERT INTO Shipment SET ?',
                    params: {
                        stripeCustomerId: customer.stripeId,
                        status: 'pending_charge',
                        isSubscriptionBox: false,
                        creationDate: now,
                        pkgWeight: shipmentWeight,
                        pkgLength: 8.5,
                        pkgWidth: 8.5,
                        pkgHeight: 2,
                        altShippingAddressId: altShippingAddressId,
                        orderMessage: orderMessage,
                        shippingRequired: true
                    }
                };

                dbUtils.query(dbConnPool, shipmentQuery, function(err, rows) {
                    if (err) {
                        return callback(err, null);
                    }
                    else {

                        var shipmentId = rows.insertId;

                        // Append shipmentId
                        for (var i = 0; i < shipmentItems.length; i++) {
                            shipmentItems[i].push(shipmentId);
                        }

                        var shipmentItemsQuery = {
                            statement: 'INSERT INTO ShipmentItem (product_id, quantity, pricePaid, shipmentId) VALUES ?',
                            params: [shipmentItems]
                        };

                        // Add shipmentId (orderId to charge)
                        chargePayload.metadata.shipmentId = shipmentId;

                        // Async insert ShipmentItems relating to this Shipment
                        dbUtils.query(dbConnPool, shipmentItemsQuery, function(err, result) {});

                        // Charge the customer and update the shipment
                        stripe.charges.create(chargePayload, function(err, charge) {
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
                                log.info("Created new charge", charge, reqIP);

                                /*
                                var chargeInsertQuery = {
                                    statement: 'INSERT INTO Charge SET ?',
                                    params: {
                                        id: charge.id,
                                        altShippingAddressId: altShippingAddressId,
                                        created: new Date(charge.created * 1000),
                                        amount: charge.amount,
                                        taxAmount: taxAmount,
                                        shippingCost: shippingCost,
                                        currency: charge.currency,
                                        customerId: charge.customer,
                                        failureCode: charge.failureCode,
                                        failureMessage: charge.failureMessage,
                                        invoiceId: charge.invoice,
                                        paid: charge.paid,
                                        serializedChargeData: metadataString
                                    }
                                };
                                */

                                var chargeInsertQuery = {
                                    statement: 'INSERT INTO Charge SET ?',
                                    params: {
                                        id: charge.id,
                                        created: new Date(charge.created * 1000),
                                        subtotal: subtotal,
                                        discount: 0,     // TODO: ADD DISCOUNT AMOUNT FROM COUPON PROVIDED
                                        chargedTax: taxAmount,
                                        chargedShipping: chargedShipping,
                                        total: charge.amount,
                                        currency: charge.currency,
                                        failureMessage: charge.failureMessage,
                                        paid: charge.paid,
                                        serializedChargeData: metadataString,
                                        altShippingAddressId: altShippingAddressId,
                                        invoiceId: charge.invoice,
                                        customerId: charge.customer,
                                        shipment_id: shipmentId
                                    }
                                };

                                // Save charge information
                                dbUtils.query(dbConnPool, chargeInsertQuery, function(err, result) {
                                    if (err) {
                                        log.error("Could not insert charge", err, reqIP);
                                    }
                                });

                                // Send receipt email
                                emailUtils.sendReceipt(customer.email, shipmentId, receiptProducts, subtotal, 0, chargedShipping, {amount: taxAmount, rate: taxRate, desc: taxDesc}, amount, function(err, res) {
                                    if (err) {
                                        log.error("Could not send receipt to customer", err, reqIP);
                                    }
                                });

                                var updateQuantityQueries = [];

                                // Decrement product stock quantity
                                for (var k = 0; k < cart.length; k++) {
                                    updateQuantityQueries.push({
                                        statement: 'UPDATE Product SET stockQuantity = (stockQuantity - ?) WHERE id = ? AND stockQuantity > 0',
                                        params : [
                                            cart[k].quantity,
                                            cart[k].id
                                        ]
                                    });
                                    dbUtils.query(dbConnPool, updateQuantityQueries[k], function(err, result){
                                        if (err) {
                                            log.error("Could not update Quantity", err, reqIP);
                                        }
                                    });
                                }

                                return callback(null, charge);
                            }
                        });

                    }

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

    }

};

module.exports = new chargeCtrl();