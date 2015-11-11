'use strict';

var log = require('../utils/logger');

var userCtrl = function() {};

userCtrl.prototype = {

    checkEmailExists: function (email, dbConnPool, callback) {

        dbConnPool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }

            connection.query("SELECT COUNT(*) FROM users WHERE email = ?", [email], function (err, rows) {
                connection.release();

                if (err) {
                    return callback(err, true);
                }

                // Email already exists
                if (rows[0]['COUNT(*)'] > 0) {
                    return callback(false, true);
                }
                // Free to use the email
                else {
                    return callback(false, false);
                }
            });
        });
    },

    getUserDetails: function (req) {
        return { email: req.user.email, stripeId: req.user.stripeId }
    },

    // Update existing customer with customerId created within Stripe
    updateCustomerId: function (email, customerId, dbConnPool, callback) {

        dbConnPool.getConnection(function (err, connection) {
            if (err) {
                return done(err);
            }

            connection.query("UPDATE users SET stripeId = ? WHERE email = ?", [customerId, email], function (err, rows) {
                connection.release();

                if (err) {
                    return callback(err, rows[0]);
                }
                else {
                    return callback(false, rows[0]);
                }
            });
        })
    }
};

module.exports = new userCtrl();
