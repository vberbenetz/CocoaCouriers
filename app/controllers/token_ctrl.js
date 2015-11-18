'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

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
                return callback(false, token);
            }
        });
    },

    create: function (req, res, callback) {

        var payload = {
            name: req.body.name,
            number: req.body.number,
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            cvc: req.body.cvc,
            address_zip: req.body.address_zip
        };

        stripe.tokens.create({card: payload}, function(err, token) {
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
                log.info('Created new token', token, req.connection.remoteAddress);
                return callback(false, token);
            }
        });
    }
};

module.exports = new tokenCtrl();