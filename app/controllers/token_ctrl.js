'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var stripe = require('stripe')(
    configPriv.sKey
);

var tokenCtrl = function() {};

tokenCtrl.prototype = {

    get: function (req, res, callback) {

        var tokenId = req.query.id;

        stripe.tokens.retrieve(tokenId, function(err, token) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(token);
            }
        });
    },

    create: function (req, res, callback) {

        var payload = {
            name: req.body.name,
            number: req.body.number,
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            cvc: req.body.cvc
        };

        stripe.tokens.create({card: payload}, function(err, token) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Created new token', token, req.connection.remoteAddress);
                return callback(token);
            }
        });
    }
};

module.exports = new tokenCtrl();