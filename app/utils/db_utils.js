'use strict';

var dbUtils = function() {};

dbUtils.prototype = {
    query: function (dbConnPool, queryObj, callback) {

        // Add stripe customer to local DB
        dbConnPool.getConnection(function (err, connection) {
            if (err) {
                return callback({
                    status: 500,
                    type: 'app',
                    msg: {
                        simplified: 'server_error',
                        detailed: err
                    }
                }, null);
            }
            else {
                connection.query(queryObj.statement, queryObj.params, function(err, rows) {
                    connection.release();
                    if (err) {
                        return callback({
                            status: 500,
                            type: 'app',
                            msg: {
                                simplified: 'server_error',
                                detailed: err
                            }
                        }, null);
                    }
                    else {
                        return callback(false, rows);
                    }
                });
            }
        });
    }
};

module.exports = new dbUtils();