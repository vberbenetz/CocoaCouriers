'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var stripe = require('stripe')(
    configPriv.sKey
);

var couponCtrl = function() {};

couponCtrl.prototype = {

    get: function(req, res, callback) {
        var couponId = req.query.id;

        stripe.coupons.retrieve(couponId, function(err, coupon) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(coupon);
            }
        })
    },

    getAll: function(req, res, callback) {
        var limit = req.query.limit;
        var cursor = req.query.cursor;

        var params = {
            limit: limit
        };

        if (typeof cursor !== 'undefined') {
            params.starting_after = cursor;
        }

        stripe.coupons.list(params, function(err, coupons) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(coupons, (cursor + limit) );
            }
        })
    },

    create: function (req, res, callback) {
        var payload = {
            id: req.body.id,
            duration: req.body.duration,
            percent_off: req.body.percentOff
        };

        // Check if expiry date for coupon passed in
        if (typeof req.body.reedemBy !== 'undefined') {
            payload.redeem_by = req.body.redeemBy;
        }

        // Check if redemption frequency passed in
        if (typeof req.body.maxRedemptions !== 'undefined') {
            payload.max_redemptions = req.body.maxRedemptions;
        }

        stripe.coupons.create(payload, function(err, coupon) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Created new coupon", coupon, req.connection.remoteAddress);
                return callback(coupon);
            }
        });
    },

    remove: function (req, res, callback) {
        var couponId = req.query.id;

        stripe.coupons.del(couponId, function(err, result) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Removed coupon with id: ", req.connection.remoteAddress);
                return callback(result);
            }
        });
    }
};

module.exports = new couponCtrl();