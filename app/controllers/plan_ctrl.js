'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var dbUtils = require('../utils/db_utils');

var stripe = require('stripe')(
    configPriv.sKey
);

// NEW VERSION
// ---------------------------

var planCtrl = function() {};

planCtrl.prototype = {

    get: function (planId, dbConnPool, callback) {
        var query = {
            statement: 'SELECT * from Plan WHERE ?',
            params: {
                id: planId,
                visible: true
            }
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows[0]);
            }
        });
    },

    list: function (dbConnPool, callback) {

        var query = {
            statement: 'SELECT * from Plan WHERE ?',
            params: {
                visible: true
            }
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    }

};

/*
var planCtrl = function() {};

planCtrl.prototype = {

    get: function (planId, callback) {
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

    create: function (payload, reqIP, callback) {
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
                log.info("Created new plan", plan, reqIP);
                return callback(false, plan);
            }
        });
    },

    remove: function (req, res, reqIP, callback) {

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
*/

module.exports = new planCtrl();