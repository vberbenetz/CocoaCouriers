'use strict';

var dbUtils = require('../utils/db_utils');

var startupCtrl = function() {};

startupCtrl.prototype = {
    testDbConn: function (dbConnPool, callback) {

        var query = {
            statement: 'SELECT version()',
            params: {}
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, true);
            }
        });

    },

    testEmail: function (emailUtils, dbErr, env, callback) {
        emailUtils.checkEmailService('val@cantangosolutions.com', dbErr, env, function(err, res) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, res);
            }
        })
    }
};

module.exports = new startupCtrl();
