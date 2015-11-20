'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

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
                return callback(false, plan);
            }
        });
    },

    list: function (req, res, callback) {
        stripe.plans.list({limit: 100}, function(err, plans) {
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
                return callback(false, plans);
            }
        });
    },

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
                log.info("Created new plan", plan, req.connection.remoteAddress);
                return callback(false, plan);
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
                log.info("Deleted plan", {planId: planId}, req.connection.remoteAddress);
                return callback(false, true);
            }
        })
    }

};

module.exports = new planCtrl();