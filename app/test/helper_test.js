'use strict';

var helpers = require('../utils/helpers');

var crypto = require('crypto');

var helperTest = function() {};

helperTest.prototype = {
    coolDownTest: function() {
        console.log(helpers.getNextBillingDate());
        console.log(helpers.isCoolDownPeriod());
        console.log(helpers.generateCoolDownDateStamps());
    },

    randomPassGenTest: function() {
        crypto.randomBytes(8, function(ex, buf) {
            var str = buf.toString('base64');
            str.substr(0, str.length-2);
        });
    }
};

module.exports = new helperTest();