'use strict';

var configPriv = require('../config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');
var helpers = require('../utils/helpers');

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
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(subscription);
            }
        });
    },

    create: function (req, res, callback) {

        var customerId = req.body.customerId;
        var payload = {
            plan: req.body.plan,
            trial_end: helpers.getNextBillingDate(customerId)
        };

        // Attach coupon code if supplied
        if (typeof req.body.coupon !== 'undefined') {
            payload.coupon = req.body.coupon;
        }

        stripe.customers.createSubscription(customerId, payload, function(err, subscription) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Created new subscription", subscription, req.connection.remoteAddress);
                return callback(subscription);
            }
        })
    },

    update: function (req, res, callback) {

        var customerId = req.query.customerId;
        var subscriptionId = req.query.subscriptionId;
        var plan = req.query.planId;
        var payload = {
            plan: plan,
            prorate: false,
            trial_end: helpers.getNextBillingDate(customerId)
        };

        stripe.customers.updateSubscription(customerId, subscriptionId, payload, function(err, subscription) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Updated subscription", subscription, req.connection.remoteAddress);
                return callback(subscription);
            }
        })
    },

    cancel: function (req, res, callback) {

        var customerId = req.query.customerId;
        var subscriptionId = req.query.subscriptionId;

        stripe.customers.cancelSubscription(customerId, subscriptionId, function(err, confirmation) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Cancelled subscription", {customerId: customerId, subscriptionId: subscriptionId}, req.connection.remoteAddress);
                return callback(confirmation);
            }
        })
    }
};

module.exports = new subscriptionCtrl();