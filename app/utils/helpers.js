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

    getNextBillingDateAfterVacation: function() {
        var vacationDates = this.generateVacationDateStamps();

        // Increment time by 1 second to 12:00:01 to take payment right after midnight
        return Math.floor( (vacationDates.endTs / 1000) + 1 );
    },

    isCoolDownPeriod: function () {

        // Get current date
        var now = new Date();
        now = now.getTime();

        var coolDownDates = this.generateCoolDownDateStamps();

        return !!( (now >= coolDownDates.startTs) && (now <= coolDownDates.endTs) );
    },

    isVacationPeriod: function () {

        var now = new Date;
        now = now.getTime();

        var vacationDates = this.generateVacationDateStamps();

        return !! ( (now >= vacationDates.startTs) && (now <= vacationDates.endTs) );
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

    // See config.vacationPeriod comment for more details
    generateVacationDateStamps: function() {
        // Validate start date (if date is a real range). Otherwise default to config documentation.
        var now = new Date();

        var start = {
            month: config.vacationPeriod.start.month,
            day: config.vacationPeriod.start.day
        };
        var end = {
            month: config.vacationPeriod.end.month,
            day: config.vacationPeriod.end.day
        };

        // Sanitize start month
        if (start.month > 12) {
            start.month = 12;
        }
        else if (start.month < 1) {
            start.month = 1;
        }

        // Sanitize start day
        if (start.day > new Date(now.getFullYear(), start.month - 1, 0).getDate() ) {
            start.day = new Date(now.getFullYear(), start.month, 0).getDate();
        }
        else if (start.day < 1) {
            start.day = 1;
        }

        // Sanitize end month
        if (end.month > 12) {
            end.month = 12;
        }
        else if (start.month < 1) {
            start.month = 1;
        }

        // Sanitize end day
        // Chance of February 29th being ignored. This is not accounted for if the end date is in the next calendar year
        // which turns out to be a leap year.
        if (end.day > new Date(now.getFullYear(), end.month - 1, 0).getDate() ) {
            end.day = new Date(now.getFullYear(), end.month, 0).getDate();
        }
        else if (end.day < 1) {
            end.day = 1;
        }

        var startDate = new Date(now.getFullYear(), start.month - 1, start.day);
        var endDate = new Date (now.getFullYear(), end.month - 1, end.day);

        // Determine if the end date is less than start in the config.
        // This indicates to roll over to the next calendar year.
        if ( (start.month > end.month) || ( (start.month === end.month) && (start.day > end.day) ) ) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        return {
            start: startDate,
            startTs: startDate.getTime(),
            end: endDate,
            endTs: endDate.getTime()
        }

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

    currencyToCountry: function(currency) {
        if (!currency) {
            return null;
        }
        currency = currency.toUpperCase();
        switch(currency) {
            case 'CAD':
                return 'CA';
            case 'USD':
                return 'US';
            default:
                return null;
        }
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
    },

    // Calculate shipping cost (in cents)
    calculateShipping: function (province, country, chargeAmount) {

        // Free shipping if amount is greater than cutoff
        if (chargeAmount >= config.freeShippingCutoff) {
            return 0;
        }

        if (country === 'CA') {
            switch (province) {
                case 'AB':
                    return 1361;
                case 'BC':
                    return 1361;
                case 'MB':
                    return 1216;
                case 'NB':
                    return 1144;
                case 'NL':
                    return 1389;
                case 'NS':
                    return 1165;
                case 'NT':
                    return 1431;
                case 'NU':
                    return 2405;
                case 'ON':
                    return 903;
                case 'PE':
                    return 1155;
                case 'QC':
                    return 996;
                case 'SK':
                    return 1216;
                case 'YT':
                    return 1431;
                default:
                    return 903;
            }
        }
        else if (country === 'US') {
            return 600;
        }
        else {
            return 0;
        }
    },

    calculateTaxPercentage: function(province) {
        var taxPercentage = 0;
        var taxDesc = '';
        switch(province) {
            case 'AB':
                taxPercentage = 5;
                taxDesc = 'GST 5%';
                break;
            case 'BC':
                taxPercentage = 12;
                taxDesc = 'GST + PST (5% + 7%)';
                break;
            case 'MB':
                taxPercentage = 13;
                taxDesc = 'GST + PST (5% + 8%)';
                break;
            case 'NB':
                taxPercentage = 13;
                taxDesc = 'HST 13%';
                break;
            case 'NL':
                taxDesc = 'HST 13%';
                taxPercentage = 13;
                break;
            case 'NS':
                taxDesc = 'HST 15%';
                taxPercentage = 15;
                break;
            case 'NT':
                taxDesc = 'GST 5%';
                taxPercentage = 5;
                break;
            case 'NU':
                taxDesc = 'GST 5%';
                taxPercentage = 5;
                break;
            case 'ON':
                taxDesc = 'HST 13%';
                taxPercentage = 13;
                break;
            case 'PE':
                taxDesc = 'HST 14%';
                taxPercentage = 14;
                break;
            case 'QC':
                taxDesc = 'GST + QST (5% + 9.975%)';
                taxPercentage = 14.98;
                break;
            case 'SK':
                taxDesc = 'GST + PST (5% + 10%)';
                taxPercentage = 10;
                break;
            case 'YT':
                taxDesc = 'GST 5%';
                taxPercentage = 5;
                break;
            default:
                taxDesc = '';
                taxPercentage = 0;
                break;
        }

        return {rate: taxPercentage, desc: taxDesc};

    }
};

module.exports = new helpers();