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

    getByUrlSubPath: function (urlSubPath, dbConnPool, callback) {
        var query = {
            statement: 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id WHERE p.urlSubPath = ?',
            params: [
                [urlSubPath]
            ]
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, false);
            }
            else if (rows.length < 1) {
                return callback(null, {});
            }
            else {
                return callback(null, rows[0]);
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

    getProductProfiles: function (dbConnPool, productId, callback) {

        var query = {
            statement: 'SELECT ppm.*, pp.* FROM ProductProfileMapping ppm INNER JOIN ProductProfile pp ON ppm.productProfileId=pp.name WHERE ?',
            params: {
                productId: productId
            }
        };

        dbUtils.query(dbConnPool, query, function(err, rows) {
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(null, rows);
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
            statement: 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id ORDER BY p.displayPriority DESC Limit 100',
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

    },

    listByFilter: function(conditions, dbConnPool, callback) {

        var query = {
            statement: 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id WHERE ',
            params: []
        };

        // Flag to keep track if query has had anything appended to it (used to see if 'AND' required)
        var queryAppended = false;

        // Add manufacturers condition
        if (conditions.manufacturers && (conditions.manufacturers.length > 0) ) {

            query.statement += '(m.id = ?';
            query.params.push(conditions.manufacturers[0]);

            for (var i = 1; i < conditions.manufacturers.length; i++) {
                query.statement += ' OR m.id = ?';
                query.params.push(conditions.manufacturers[i]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        // Add manufacturer location
        if (conditions.manufacturerOrigins && (conditions.manufacturerOrigins.length > 0) ) {

            if (queryAppended) {
                query.statement += 'AND ';
            }

            query.statement += '(m.origin = ?';
            query.params.push(conditions.manufacturerOrigins[0]);

            for (var j = 1; j < conditions.manufacturerOrigins.length; j++) {
                query.statement += ' OR m.origin = ?';
                query.params.push(conditions.manufacturerOrigins[j]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        // Add cocoa bean location
        if (conditions.cocoaOrigins && (conditions.cocoaOrigins.length > 0) ) {

            if (queryAppended) {
                query.statement += 'AND ';
            }

            query.statement += '(p.cocoaOrigin = ?';
            query.params.push(conditions.cocoaOrigins[0]);

            for (var k = 1; k < conditions.cocoaOrigins.length; k++) {
                query.statement += ' OR p.cocoaOrigin = ?';
                query.params.push(conditions.cocoaOrigins[k]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        // Add product type
        if (conditions.productTypes && (conditions.productTypes.length > 0) ) {

            if (queryAppended) {
                query.statement += 'AND ';
            }

            query.statement += '(p.productType = ?';
            query.params.push(conditions.productTypes[0]);

            for (var x = 1; x < conditions.productTypes.length; x++) {
                query.statement += ' OR p.productType = ?';
                query.params.push(conditions.productTypes[x]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        // Flavor Profiles
        if (conditions.flavorProfiles && (conditions.flavorProfiles.length > 0) ) {

            if (queryAppended) {
                query.statement += 'AND ';
            }

            query.statement += 'p.id IN (SELECT productId FROM ProductProfileMapping WHERE productProfileId = ?';
            query.params.push(conditions.flavorProfiles[0]);

            for (var y = 1; y < conditions.flavorProfiles.length; y++) {
                query.statement += ' AND productProfileId = ?';
                query.params.push(conditions.flavorProfiles[y]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        // Dietary Profiles
        if (conditions.dietaryProfiles && (conditions.dietaryProfiles.length > 0) ) {

            if (queryAppended) {
                query.statement += 'AND ';
            }

            query.statement += 'p.id IN (SELECT productId FROM ProductProfileMapping WHERE productProfileId = ?';
            query.params.push(conditions.dietaryProfiles[0]);

            for (var z = 1; z < conditions.dietaryProfiles.length; z++) {
                query.statement += ' AND productProfileId = ?';
                query.params.push(conditions.dietaryProfiles[z]);
            }

            query.statement += ') ';

            queryAppended = true;
        }

        if (queryAppended) {
            query.statement += 'ORDER BY p.displayPriority DESC';

            dbUtils.query(dbConnPool, query, function(err, rows) {
                if (err) {
                    return callback(err, null);
                }
                else {
                    return callback(false, rows);
                }
            });
        }

        // No params added, use default query
        else {
            query.statement = 'SELECT p.*, m.name as m_name, m.description as m_description, m.origin as m_origin, m.website as m_website FROM Product p INNER JOIN Manufacturer m ON p.manufacturer_id=m.id ORDER BY p.displayPriority DESC Limit 100';
            dbUtils.query(dbConnPool, query, function(err, rows) {
                if (err) {
                    return callback(err, null);
                }
                else {
                    return callback(false, rows);
                }
            });
        }

    },

    listProfiles: function (dbConnPool, callback) {

        var query = {
            statement: 'SELECT * FROM ProductProfile',
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
    },

    listCocoaOrigins: function (dbConnPool, callback) {
        var query = {
            statement: 'SELECT DISTINCT cocoaOrigin as origin FROM Product',
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
