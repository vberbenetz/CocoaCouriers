'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var stripe = require('stripe')(
    configPriv.sKey
);

var planCtrl = function() {};

planCtrl.prototype = {

    get: function (req, res, callback) {
        var planId = req.query.id;
        stripe.plans.retrieve(planId, function(err, plan) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(plan);
            }
        });
    },

    list: function (req, res, callback) {
        stripe.plans.list({limit: 100}, function(err, plans) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(plans);
            }
        });
    }
/*
    create: function (req, res, callback) {
        var payload = {
            id: req.body.id,
            amount: req.body.amount,
            currency: req.body.currency,
            interval: req.body.interval,
            name: req.body.name
        };

        stripe.plans.create(payload, function(err, plan) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Created new plan', plan, req.connection.remoteAddress);
                return callback(plan);
            }
        });
    },

    remove: function (req, res, callback) {

// TODO: NEED TO MODIFY USERS WHO ARE CURRENTLY SUBSCRIBED TO THIS.
// TODO: SUGGEST FORCING THE ADMIN TO SELECT A NEW PLAN FOR EXISTING USERS PRIOR TO DELETION

        var planId = req.query.planId;
        stripe.plans.del(planId, function(err, confirmation) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Removed plan: ' + planId, req.connection.remoteAddress);
                return callback(confirmation);
            }
        })
    }
    */
};

module.exports = new planCtrl();