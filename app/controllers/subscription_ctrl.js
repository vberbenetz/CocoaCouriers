'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

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

        var customerId = req.body.customer;
        var payload = {
            plan: req.body.plan
        };

        // Attach coupon code if supplied
        if ( (typeof req.body.coupon !== 'undefined') && (req.body.coupon.length !== 0) && (req.body.coupon !== '') ) {
            payload.coupon = req.body.coupon;
        }

        stripe.customers.createSubscription(customerId, payload, function(err, subscription) {
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
                log.info("Created new subscription", subscription, req.connection.remoteAddress);
                return callback(false, subscription);
            }
        })
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