'use strict';

var log = require('../utils/logger');
var helpers = require('../utils/helpers');

var userCtrl = function() {};

userCtrl.prototype = {

    checkEmailExists: function (email, dbConnPool, callback) {

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

            connection.query("SELECT COUNT(*) FROM users WHERE email = ?", [email], function (err, rows) {
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
        return { email: req.user.email, stId: req.user.stId }
    },

    updateEmail: function (req, dbConnPool, callback) {

        var newEmail = req.body.newEmail;
        var currentPassword = req.body.currentPassword;
        var oldEmail = req.user.email;

        // Check if email already exists
        this.checkEmailExists(newEmail, dbConnPool, function(err, result) {
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
            else if (result) {
                return callback({
                    status: 409,
                    type: 'app',
                    msg: {
                        simplified: 'email_exists',
                        detailed: 'userCtrl.updateEmail() -- email exists'
                    }
                }, null);
            }
            else {

                // Verify user's password
                helpers.verifyPassword(req.user.password, currentPassword, function (result) {
                    if (result) {

                        // Update the email internally
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

                            connection.query("UPDATE users SET email = ? WHERE id = ?", [newEmail, req.user.id], function (err, rows) {
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

                                    log.info('Updated email on internal DB', {
                                        oldEmail: oldEmail,
                                        newEmail: newEmail
                                    }, req.connection.remoteAddress);

                                    var updatedUser = req.user;
                                    updatedUser.email = newEmail;

                                    // Refresh session for new credentials
                                    req.login(updatedUser, function (err) {

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

                                        return callback(false, updatedUser);
                                    });

                                }
                            })
                        });

                    }
                    // Passwords do not match
                    else {
                        return callback({
                            status: 401,
                            type: 'app',
                            msg: {
                                simplified: 'incorrect_password',
                                detailed: 'userCtrl.updateEmail() -- current password does not match'
                            }
                        }, null);
                    }
                });
            }
        });
    },

    updatePassword: function (req, dbConnPool, callback) {

        // Verify user's password
        helpers.verifyPassword(req.user.password, currentPassword, function (result) {
            if (result) {

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

                    // Hash password
                    var newPass = bcrypt.hashSync(req.body.newPass, 11);

                    // Get and update user password
                    var updatedUser = req.user;
                    updatedUser.password = newPass;

                    connection.query("UPDATE users SET password = ? WHERE id = ?", [newPass, req.user.id], function (err, rows) {
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
                            log.info('Updated user password', req.user, req.connection.remoteAddress);

                            // Refresh session with new credentials
                            req.login(updatedUser, function (err) {
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

                                return callback(false, updatedUser);
                            });
                        }
                    })
                });
            }
            // Passwords do not match
            else {
                return callback({
                    status: 401,
                    type: 'app',
                    msg: {
                        simplified: 'incorrect_password',
                        detailed: 'userCtrl.updateEmail() -- current password does not match'
                    }
                }, null);
            }

        });
    },

    // Update existing customer with customerId created within Stripe
    updateCustomerId: function (email, customerId, dbConnPool, callback) {

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

            connection.query("UPDATE users SET stId = ? WHERE email = ?", [customerId, email], function (err, rows) {
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
                    return callback(false, rows[0]);
                }
            });
        })
    }
};

module.exports = new userCtrl();
