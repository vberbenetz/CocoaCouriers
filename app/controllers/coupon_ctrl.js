'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var helpers = require('../utils/helpers');

var dbUtils = require('../utils/db_utils');

var stripe = require('stripe')(
    configPriv.sKey
);

var couponCtrl = function() {};

couponCtrl.prototype = {

    verifySubscriptionCoupon: function(couponId, planId, userCountry, callback) {

        if (!couponId || !planId || !userCountry) {
            return callback({
                status: 404,
                type: 'stripe',
                msg: {
                    simplified: 'not_found',
                    detailed: 'No couponId supplied'
                }
            });
        }

        stripe.coupons.retrieve(couponId, function(err, coupon) {
            if (err) {
                if (err.rawType === 'invalid_request_error') {
                    return callback({
                        status: 404,
                        type: 'stripe',
                        msg: {
                            simplified: 'not_found',
                            detailed: err
                        }
                    });
                }
                else {
                    return callback({
                        status: 500,
                        type: 'stripe',
                        msg: {
                            simplified: 'server_error',
                            detailed: err
                        }
                    }, null);
                }
            }
            else {
                if (!coupon.valid) {
                    return callback({
                        status: 404,
                        type: 'stripe',
                        msg: {
                            simplified: 'not_found',
                            detailed: err
                        }
                    });
                }
                else {
                    // Applied to wrong country
                    if (coupon.metadata.applicable_country !== userCountry) {
                        return callback({
                            status: 404,
                            type: 'stripe',
                            msg: {
                                simplified: 'not_found',
                                detailed: err
                            }
                        });
                    }

                    // Is not restricted to a specific plan
                    if (!coupon.metadata.applicable_plan_ids) {
                        return callback(false, coupon);
                    }
                    else {
                        var idFound = false;
                        var strIds = coupon.metadata.applicable_plan_ids.split(',');
                        strIds.forEach(function(id) {
                            if (id === planId) {
                                idFound = true;
                            }
                        });

                        if (idFound) {
                            return callback(false, coupon);
                        }
                        else {
                            return callback({
                                status: 404,
                                type: 'stripe',
                                msg: {
                                    simplified: 'not_found',
                                    detailed: err
                                }
                            });
                        }
                    }
                }
            }
        })
    },

    verifyOtherCoupon: function(couponId, userCountry, dbConnPool, callback) {

        if (!couponId || !userCountry) {
            return callback({
                status: 404,
                type: 'stripe',
                msg: {
                    simplified: 'not_found',
                    detailed: 'No couponId supplied'
                }
            });
        }
        else {

            console.log(new Date());

            var couponQuery = {
                statement: 'SELECT * FROM Coupon WHERE id = ?, valid = ?, applicableCountry = ?, redeemBy > ?',
                params: [couponId, true, userCountry, new Date()]
            };

            dbUtils.query(dbConnPool, couponQuery, function(err, rows) {
                if (err) {
                    return callback(err, null);
                }
                else if (rows[0]['COUNT(*)'] === 0) {
                    return callback('Coupon: ' + couponId + ' not found', false);
                }
                else {

                    // Verify if coupon is only valid for a specific set of products
                    var couponProductQuery = {
                        statement: 'SELECT * FROM CouponProduct WHERE ?',
                        params: {
                            couponId: couponId
                        }
                    };

                    dbUtils.query(dbConnPool, couponProductQuery, function(err, rows) {
                        if (err) {
                            return callback(err, null);
                        }
                        else if (rows[0]['COUNT(*)'] > 0) {
// TODO: CHECK IF IT APPLIES TO USER'S CART PRODUCTS
                            return callback('Coupon: ' + couponId + ' not valid', false);
                        }
                        else {
                            return callback('Coupon: ' + couponId + ' not valid', false);
                        }
                    });
                }
            });
        }
    }

/*
    applyCouponToCharge: function(couponId, shipmentItems, subTotal, callback) {
        this.verifyCoupon(couponId, function(err, coupon) {
            if (err) {
                if (err.status !== 404) {
                    log.error(err.msg.detailed, null, null);
                }
                return null;
            }
            else {

                // Is not restricted to a specific product
                if (coupon.metadata.ids === null) {}

            }
        });
    }
*/

};

module.exports = new couponCtrl();