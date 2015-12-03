'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var stripe = require('stripe')(
    configPriv.sKey
);

var couponCtrl = function() {};

couponCtrl.prototype = {

    get: function(couponId, callback) {

        stripe.coupons.retrieve(couponId, function(err, coupon) {
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
                return callback(false, coupon);
            }
        })
    },

    getAll: function(limit, cursor, callback) {

        if (typeof limit === 'undefined') {
            limit = 100;
        }

        var params = {
            limit: limit
        };

        if (typeof cursor !== 'undefined') {
            params.starting_after = cursor;
        }

        stripe.coupons.list(params, function(err, coupons) {
            if (err) {
                console.log(err);
                return callback({
                    status: 500,
                    type: 'stripe',
                    msg: {
                        simplified: 'server_error',
                        detailed: err
                    }
                }, null, null);
            }
            else {
                return callback(false, coupons, (cursor + limit) );
            }
        })
    },

    create: function (payload, reqIP, callback) {

        stripe.coupons.create(payload, function(err, coupon) {
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
                log.info("Created new coupon", coupon, reqIP);
                return callback(false, coupon);
            }
        });
    },

    remove: function (couponId, reqIP, callback) {

        stripe.coupons.del(couponId, function(err, result) {
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
                log.info("Removed coupon with id: ", reqIP);
                return callback(false, result);
            }
        });
    }
};

module.exports = new couponCtrl();