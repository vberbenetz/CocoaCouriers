'use strict';

var log = require('../utils/logger');

var dbUtils = require('../utils/db_utils');

var productCtrl = function() {};

productCtrl.prototype = {

    getById: function (productId, dbConnPool, callback) {

        var query = {
            statement: 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id WHERE p.id = ?',
            params: [productId]
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, false);
            }
            else if (rows.length < 1) {
                return callback(err, {});
            }
            else {
                return callback(err, rows[0]);
            }
        });

    },

    getByIdList: function (dbConnPool, productIds, callback) {

        var query = {
            statement: 'SELECT * FROM Product WHERE id IN ?',
            params: [productIds]
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
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

        var query = {
            statement: 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id',
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

module.exports = new productCtrl();
