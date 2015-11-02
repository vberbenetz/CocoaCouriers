'use strict';

var configPriv = require('../config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var stripe = require('stripe')(
    configPriv.sKey
);

var chargeCtrl = function() {};

chargeCtrl.prototype = {

    get: function (req, callback) {
        var chargeId = req.query.id;

    },

    create: function (req, res, callback) {
        var payload = {
            amount: req.body.amount,
            currency: req.body.currency,
            description: req.body.description,
            receipt_email: req.body.customerEmail,
            shipping: req.body.customerShipping,
            customer: req.body.customerId
        };

        stripe.charges.create(payload, function(err, charge) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Created new charge", charge, req.connection.remoteAddress);
                return callback(charge);
            }
        });
    },

    update: function (req, res, callback) {
        var customerId = req.query.id;
        var item = req.body.item;
        var data = req.body.data;
        var payload;

        switch (item) {
            case 'description':
                payload = {description: data};
                break;
            case 'email':
                payload = {receipt_email: data};
                break;
            case 'shipping':
                payload = {shipping: shipping};
                break;
            default:
                errorHandler.appErrors(res, 404, 'chargeCtrl.update() unknown item: ' + item, req.connection.remoteAddress);
                break;
        }

        stripe.charges.update(customerId, payload, function(err, charge) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info("Updated charge", {item: item, data: data}, req.connection.remoteAddress);
                return callback(charge);
            }
        });
    }
};

module.exports = new chargeCtrl();