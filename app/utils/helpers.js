'use strict';

var bcrypt = require('bcrypt');

var config = require('../configuration/config');
var log = require('./logger');

var helpers = function() {};

helpers.prototype = {

    getNextBillingDate: function (customerId) {

        var dayOfMonthToBill = config.billingDay;

        if (dayOfMonthToBill > 28) {
            dayOfMonthToBill = 28;
            log.warn('dayOfMonthToBill is greater than 28. Issues with billing cycle will occur', {object: 'helpers.getNextBillingDate'});
        }

        var now = new Date();
        var nextBillingDate;    // Ex: 2015/01/31 00:01:00

        try {
            if (now.getMonth() == 11) {
                nextBillingDate = new Date(now.getFullYear() + 1, 0, dayOfMonthToBill);
            }
            else {
                nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonthToBill);
            }
        }
        catch (ex) {
            log.error('Error adding customer: ' + customerId + 'to billing cycle. Billing currently set at: ' + now.toDateString(), {object: 'helpers.getNextBillingDate'});
            return null;
        }

        // Return unix timestamp of next billing date
        return (nextBillingDate.getTime() / 1000);

    },

    isCoolDownPeriod: function () {

        var coolDownPeriod = config.coolDownPeriod;

        if (coolDownPeriod.start >= coolDownPeriod.end) {
            log.error("Cool off period is incorrect!!!", coolDownPeriod);
            return true;
        }

        // Create first and last dates of cool down period
        var now = new Date();

        var coolDownStart = new Date(now.getFullYear(), now.getMonth(), coolDownPeriod.start);
        var coolDownEnd;

        if (coolDownPeriod.end === 'end_of_month') {
            coolDownEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        else {
            coolDownEnd = new Date(now.getFullYear(), now.getMonth(), coolDownPeriod.end);
        }

        // Convert to unix timestamp for comparisons
        coolDownStart = coolDownStart.getTime() / 1000;
        coolDownEnd = coolDownEnd.getTime() / 1000;
        now = now.getTime() / 1000;

        return !!( (now >= coolDownStart) && (now <= coolDownEnd) );
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