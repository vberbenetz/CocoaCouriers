'use strict';

var helpers = require('../utils/helpers');

var helperTest = function() {};

helperTest.prototype = {
    coolDownTest: function() {
        console.log(helpers.getNextBillingDate());
        console.log(helpers.isCoolDownPeriod());
        console.log(helpers.generateCoolDownDateStamps());
    }
};

module.exports = new helperTest();