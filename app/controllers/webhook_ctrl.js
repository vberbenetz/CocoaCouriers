'use strict';

var configPriv = require('../configuration/config_priv');
var log = require('../utils/logger');

var userCtrl = require('./user_ctrl');

var stripe = require('stripe')(
    configPriv.sKey
);

var webhookCtrl = function() {};

webhookCtrl.prototype = {

    invoiceCreated: function (req, res, callback) {
        console.log(req.body);
    }
};

module.exports = new userCtrl();