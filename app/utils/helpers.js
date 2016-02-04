'use strict';

var bcrypt = require('bcrypt');

var config = require('../configuration/config');
var log = require('./logger');

var helpers = function() {};

helpers.prototype = {

    getNextBillingDate: function (plan_interval) {

        var coolDownPeriod = this.generateCoolDownDateStamps();

        // Increment time by 1 second to 12:00:01 to take payment right after cut-off
        if (this.isCoolDownPeriod()) {
            return Math.floor( (coolDownPeriod.endTs / 1000) + 1 );
        }
        else {
            // Generate next month's billing date (interval needed because user already charged for first block)
            coolDownPeriod.end.setMonth(coolDownPeriod.end.getMonth() + plan_interval);
            coolDownPeriod.endTs = coolDownPeriod.end.getTime();
            return Math.floor( (coolDownPeriod.endTs / 1000) + 1 );
        }
    },

    isCoolDownPeriod: function () {

        // Get current date
        var now = new Date();
        now = now.getTime();

        var coolDownDates = this.generateCoolDownDateStamps();

        return !!( (now >= coolDownDates.startTs) && (now <= coolDownDates.endTs) );
    },

    generateCoolDownDateStamps: function() {
        var now = new Date();
        var start = new Date(now.getFullYear(), now.getMonth(), config.coolDownPeriod.start);
        var end = new Date(now.getFullYear(), now.getMonth(), config.coolDownPeriod.end);
        return {
            start: start,
            startTs: start.getTime(),
            end: end,
            endTs: end.getTime()
        };
    },

    verifyPassword: function (existingPassword, passToCompare, callback) {
        bcrypt.compare(passToCompare, existingPassword, function(err, res) {
            return callback(res);
        });
    },

    hashPasswordSync: function (rawPassword) {
        return bcrypt.hashSync(rawPassword, 11);
    },

    sourceCountryPlanId: function(planId, isoCountry) {
        var splitPlanId = planId.split('_');
        var newPlanId = splitPlanId[0];

        switch(isoCountry) {
            case 'CA':
                newPlanId += '_cad';
                break;
            case 'US':
                newPlanId += '_usd';
                break;
            default:
                newPlanId += '_cad';
                break;
        }

        for (var i = 2; i < splitPlanId.length; i++) {
            newPlanId += '_' + splitPlanId[i];
        }

        return newPlanId;
    },

    filterRecurringSubscriptions: function (subscriptions) {
        for (var i = 0; i < subscriptions.data.length; i++) {
            if (subscriptions.data[i].plan.metadata.is_gift === 'false') {
                return subscriptions.data[i];
            }
        }

        return null;
    },

    formatStripeShipping: function (obj) {
        return {
            name: obj.name,
            address: {
                line1: obj.street1,
                line2: obj.street2,
                city: obj.city,
                state: obj.state,
                postal_code: obj.postalCode,
                country: obj.country
            }
        }
    }
};

module.exports = new helpers();