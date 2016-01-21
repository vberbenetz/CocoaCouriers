'use strict';

var log = require('../utils/logger');

var productCtrl = function() {};

productCtrl.prototype = {

    getById: function (productId, dbConnPool, callback) {

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

            connection.query("SELECT * FROM Product WHERE id = ?", [productId], function (err, rows) {
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
                else if (rows.length < 1) {
                    return callback(err, {});
                }
                else {
                    return callback(err, rows[0]);
                }

            });
        })
    },

    listByProductType: function (productTypeId, dbConnPool, callback) {

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

            connection.query("SELECT * FROM Product WHERE productTypeId = ?", [productTypeId], function (err, rows) {
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
                    return callback(err, rows);
                }

            });
        });

    },

    list: function (dbConnPool, callback) {

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

            connection.query("SELECT * FROM Product", [], function (err, rows) {

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
        });

    }

};

module.exports = new productCtrl();
