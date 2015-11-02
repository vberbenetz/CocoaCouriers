'use strict';

var configPriv = require('../config_priv');
var log = require('../utils/logger');
var errorHandler = require('../utils/error_handler');

var subscriptionCtrl = require('./subscription_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var customerCtrl = function() {};

customerCtrl.prototype = {

    get: function (req, res, callback) {
        var customerId = req.query.id;

        stripe.customers.retrieve(customerId, function(err, customer) {
            if(err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                return callback(customer);
            }
        })
    },

    create: function (req, res, callback) {
        var shipping = {
            name: req.body.name,
            address: {
                line1: req.body.line1,
                city: req.body.city,
                country: req.body.country,
                postal_code: req.body.postalCode,
                state: req.body.state
            }
        };

        // Attach line 2 if supplied
        if (typeof req.body.line2 !== 'undefined') {
            shipping.address.line2 = req.body.line2;
        }

        var email = req.body.email;
        var source = req.body.source;
        var taxRate = calculateTaxPercentage(shipping.address.state);

        var payload = {
            email: email,
            shipping: shipping,
            source: source,
            metadata: {
                taxRate: taxRate
            }
        };

        stripe.customers.create(payload, function(err, customer) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Created customer', {customer: customer}, req.connection.remoteAddress);

                req.body.customerId = customer.id;

                // Create invoice tax line

                // Subscribe user to plan
                subscriptionCtrl.create(req, res, function(subscription) {
                    if (!err) {
                        customer.subscriptions.data.push(subscription);
                    }
                    return callback(customer);
                });
            }
        })
    },

    update: function (req, res, callback) {
        var customerId = req.query.id;
        var item = req.body.item;
        var data = req.body.data;
        var payload;

        switch (item) {
            case 'coupon':
                payload = {coupon: data};
                break;
            case 'email':
                payload = {email: data};
                break;
            case 'shipping':
                payload = {shipping: data};
                break;
            case 'source':
                payload = {source: data};
                break;
            default:
                errorHandler.appErrors(res, 'Unknown item: ' + item, {object: 'customerCtrl.update()', httpErrorCode: 404}, req.connection.remoteAddress);
                break;
        }

        stripe.customers.update(customerId, payload, function(err, customer) {
            if (err) {
                console.log(err);
                errorHandler.stripeHttpErrors(res, err, req.connection.remoteAddress);
            }
            else {
                log.info('Updated customer', {customerId: customerId, item: item, data: data}, req.connection.remoteAddress);
                return callback(customer);
            }
        });
    }
};


function calculateTaxPercentage(province) {
    var taxPercentage = 0;
    switch(province) {
        case 'AB':
            taxPercentage = 5;
            break;
        case 'BC':
            taxPercentage = 12;
            break;
        case 'MB':
            taxPercentage = 13;
            break;
        case 'NB':
            taxPercentage = 13;
            break;
        case 'NL':
            taxPercentage = 13;
            break;
        case 'NS':
            taxPercentage = 15;
            break;
        case 'NT':
            taxPercentage = 5;
            break;
        case 'NU':
            taxPercentage = 5;
            break;
        case 'ON':
            taxPercentage = 13;
            break;
        case 'PE':
            taxPercentage = 14;
            break;
        case 'QC':
            taxPercentage = 14.975;
            break;
        case 'SK':
            taxPercentage = 10;
            break;
        case 'YT':
            taxPercentage = 5;
            break;
        default:
            break;
    }

    return taxPercentage;

}

module.exports = new customerCtrl();