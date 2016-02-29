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
    },

    emailTest: function(emailUtils) {
        emailUtils.sendNewPassword('val@cantangosolutions.com', 'TestPass', function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result);
            }
        });
    }
};

module.exports = new helperTest();