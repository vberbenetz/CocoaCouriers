'use strict';

var dbUtils = require('../utils/db_utils');

var manufacturerCtrl = function() {};

manufacturerCtrl.prototype = {

    list: function (dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM Manufacturer',
            params: []
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(false, rows);
            }
        });

    }

};

module.exports = new manufacturerCtrl();