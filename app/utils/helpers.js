'use strict';

var bcrypt = require('bcrypt');

var config = require('../configuration/config');
var log = require('./logger');

var helpers = function() {};

helpers.prototype = {

    getNextBillingDate: function () {
        var coolDownDates = this.findCoolDownStartAndEndDate();

        // Increment time by 1 second to 12:00:01 to not conflict with cooldown end date
        return Math.floor( (coolDownDates.end.getTime() / 1000) + 1 );
    },

    isCoolDownPeriod: function () {

        var coolDownDates = this.findCoolDownStartAndEndDate();

        // Get current date
        var now = new Date();

        // Convert to timestamp for comparisons
        coolDownDates.start = coolDownDates.start.getTime();
        coolDownDates.end = coolDownDates.end.getTime();
        now = now.getTime();

        return !!( (now >= coolDownDates.start) && (now <= coolDownDates.end) );
    },

    /**
     * Finds the cool down start and end dates.
     * Cool down periods will go from an occurrence of a specific day to 12:00:01 of the first day of the next month
     * Re-billing will always occur on the 1st of the following month
     *
     * Example:
     *
     * config.coolDownPeriod = {
     *      day: 'friday'
     *      start: 3,
     *      end: 'first_of_next_month'
     * }
     *
     * Today: November 23rd, 2015
     * Result: 3rd Friday of November to 1st Monday of December 12:00:00
     * Billing: 1st December 12:00:01
     *
    */
    findCoolDownStartAndEndDate: function() {

        var coolDownPeriod = config.coolDownPeriod;
        var day = this.convertStringDayToNumber(coolDownPeriod.day);

        var coolDownDates = {
            start: new Date(),
            end: new Date()
        };

        // Remove time portion from dates to normalize time of future invoices
        coolDownDates.start.setHours(0,0,0,0);
        coolDownDates.end.setHours(0,0,0,0);

        if (day === null) {
            log.error('CoolDownPeriod.day in config could not be translated. Defaulting to FRIDAY');
            day = 5;
        }

        var d = new Date();

        // Set to first of month
        d.setDate(1);
        d.setHours(0,0,0,0);

        // Get first occurrence of day in month
        while (d.getDay() !== day) {
            d.setDate(d.getDate() + 1);
        }

        // Calculate start date of cool-down period. If > end of month, then set to end of month
        coolDownDates.start.setDate( d.getDate() + ( (coolDownPeriod.start-1) * 7 ) );
        var endOfThisMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        if (coolDownDates.start.getMonth() !== endOfThisMonth.getMonth()) {
            coolDownDates.start = endOfThisMonth;
        }

        // Calculate end date of cool-down period
        if (d.getMonth() === 11) {
            coolDownDates.end.setFullYear(d.getFullYear() + 1, 0, 1);
        }
        else {
            coolDownDates.end.setFullYear(d.getFullYear(), d.getMonth() + 1, 1);
        }

        return coolDownDates;
    },

    convertStringDayToNumber: function(stringDay) {
        stringDay = stringDay.toUpperCase();
        var day = null;

        switch (stringDay) {
            case 'SUNDAY':
                day = 0;
                break;
            case 'MONDAY':
                day = 1;
                break;
            case 'TUESDAY':
                day = 2;
                break;
            case 'WEDNESDAY':
                day = 3;
                break;
            case 'THURSDAY':
                day = 4;
                break;
            case 'FRIDAY':
                day = 5;
                break;
            case 'SATURDAY':
                day = 6;
                break;
            default:
                break;
        }
        return day;
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