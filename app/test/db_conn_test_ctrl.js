'use strict';

var dbConnTestCtrl = function() {};

dbConnTestCtrl.prototype = {
    test: function (dbConnPool, callback) {

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

            connection.query("SELECT version()", function (err, rows) {
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

                return callback(null, true);
            });
        });

    },

    testDuplicateInsert: function(dbConnPool, callback) {
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

            connection.query(
                "INSERT INTO DefaultShippingAddress values('a','a',null,null,null,null,null,null,null)",
                function (err, rows) {
                    connection.release();

                    if (err) {
                        console.log(err);
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
                        return callback(null, true);
                    }
                }
            );
        });
    }
};

module.exports = new dbConnTestCtrl();
