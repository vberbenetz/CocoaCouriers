'use strict';

var configPriv = require('../configuration/config_priv');
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

    oneTimeCharge: function (req, res, callback) {

        // Retrieve plan first
        stripe.plans.cre

        var payload = {
            customer: req.user.stId,
            amount: req.body.amount,
            currency: req.body.currency,
            description: req.body.description,
            receipt_email: req.body.customerEmail,
            shipping: req.body.customerShipping,
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
    }

};

module.exports = new chargeCtrl();