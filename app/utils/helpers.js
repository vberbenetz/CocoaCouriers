'use strict';

var bcrypt = require('bcrypt');

var config = require('../configuration/config');
var log = require('./logger');

var helpers = function() {};

helpers.prototype = {

    getNextBillingDate: function(customerId) {

        var dayOfMonthToBill = config.billingDay;

        if (dayOfMonthToBill > 28) {
            dayOfMonthToBill = 28;
            log.warn('dayOfMonthToBill is greater than 28. Issues with billing cycle will occur', {object: 'helpers.getNextBillingDate'});
        }

        var now = new Date();
        var nextBillingDate;    // Ex: 2015/01/31 00:01:00

        try {
            if (now.getMonth() == 11) {
                nextBillingDate = new Date(now.getFullYear() + 1, 0, dayOfMonthToBill, 0, 1, 0);
            }
            else {
                nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonthToBill, 0, 1, 0);
            }
        }
        catch (ex) {
            log.error('Error adding customer: ' + customerId + 'to billing cycle. Billing currently set at: ' + now.toDateString(), {object: 'helpers.getNextBillingDate'});
            return null;
        }

        // Return unix timestamp of next billing date
        return (nextBillingDate.getTime() / 1000);

    },

    verifyPassword: function (existingPassword, passToCompare, callback) {
        bcrypt.compare(passToCompare, existingPassword, function(err, res) {
            return callback(res);
        });
    },

    hashPasswordSync: function (rawPassword) {
        return bcrypt.hashSync(rawPassword, 11);
    }

};

module.exports = new helpers();