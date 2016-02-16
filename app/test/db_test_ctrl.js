'use strict';

var dbConnTestCtrl = function() {};

var dbUtils = require('../utils/db_utils');

dbConnTestCtrl.prototype = {
    test: function (dbConnPool, callback) {

        var query = {
            statement: 'SELECT version()',
            params: {}
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            console.log(rows);
            return callback(err, rows);
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
                "INSERT INTO DefaultShippingAddress values('c','a',null,null,null,null,null,null,null)",
                function (err, rows) {
                    connection.release();

                    console.log(rows[0]);

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
    },

    testUpdate: function(dbConnPool, callback) {
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
                "UPDATE DefaultShippingAddress SET city = ?", ['ffff'],
                function (err, rows) {
                    connection.release();

                    console.log(rows[0]);

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
    },

    testOptimizedUpdate: function(dbConnPool, callback) {
        var stripeId = undefined;

        var query = {
            statement: 'UPDATE BillingAddress SET ? WHERE ?',
            params: [
                {
                    name: 'MY Name',
                    company: 'Company A',
                    street1: '4600 Street Rd',
                    street2: 'Suite 2000',
                    city: 'Vancouver',
                    state: 'BC',
                    postalCode: 'v6w1a1',
                    country: 'CA'
                },
                {
                    stripeId: stripeId
                }
            ]
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, rows);
            }
        });
    },

    testListOfIds: function(dbConnPool, callback) {
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

            var ids = ['a', 'b'];
            var query = {
                statement: 'SELECT * FROM DefaultShippingAddress WHERE customerId IN (?)',
                params: ids
            };

            dbUtils.query(dbConnPool, query, function(err, rows) {
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
                    return callback(null, rows);
                }
            });
        });
    }
};

module.exports = new dbConnTestCtrl();
