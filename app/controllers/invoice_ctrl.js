'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var stripe = require('stripe')(
    configPriv.sKey
);

var invoiceCtrl = function() {};

invoiceCtrl.prototype = {

    addTaxItem: function (customer, planId, tax, isCoolDownPeriod, res, callback) {

        // Flag used to prevent adding tax item if user subscribes during cool-down period.
        // This is used a fix here to prevent callback hell in the subscription controller
        if (isCoolDownPeriod) {
            return callback(false, null);
        }

        // Retrieve plan amount details
        stripe.plans.retrieve(planId, function(err, plan) {

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

            var taxRate = tax.rate;
            var taxAmount = Math.round( (taxRate/100) * plan.amount ); // Convert to cents in whole numbers

            var payload = {
                customer: customer,
                amount: taxAmount,
                currency: 'cad',
                description: tax.desc
            };

            // Add invoice number
            stripe.invoiceItems.create(payload, function(err, invoiceItem) {

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

                return callback(false, invoiceItem);
            });

        });

    },

    removeItem: function (invoiceItemId, res, callback) {

        stripe.invoiceItems.del(invoiceItemId, function(err, confirmation) {
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

            return callback(false, confirmation);
        });
    }
};

module.exports = new invoiceCtrl();
