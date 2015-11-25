'use strict';

var helpers = require('../utils/helpers');

var helperTest = function() {};

helperTest.prototype = {
    findCoolDownStartAndEndDate: function() {
        var coolDownDates = helpers.findCoolDownStartAndEndDate();
        console.log(coolDownDates.start.getFullYear() + '/' + (coolDownDates.start.getMonth() + 1) + '/' + coolDownDates.start.getDate()  + ' -- ' + coolDownDates.start.getTime());
        console.log(coolDownDates.end.getFullYear() + '/' + (coolDownDates.end.getMonth() + 1) + '/' + coolDownDates.end.getDate() + ' -- ' + coolDownDates.end.getTime());
    }
};

module.exports = new helperTest();