'use strict';

var LocalStrategy = require('passport-local').Strategy;

var bcrypt = require('bcrypt');
var crypto = require('crypto');

module.exports = function(passport, dbConnPool) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        dbConnPool.getConnection(function(err, connection) {
            if (err) {
                return done(err);
            }

            connection.query("select * from users where id = ?", [id], function(err, rows) {
                connection.release();

                if (err) {
                    return done(err);
                }
                done(err, rows[0]);
            });
        });
    });


    // Local signup (credentials stored in-house
    passport.use ('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {

        var newPass = password;

        // Generate a new random password
        crypto.randomBytes(8, function(ex, buf) {
            var str = buf.toString('base64');
            str.substr(0, str.length-2);
        });

        // Check if email is already taken and in use
        dbConnPool.getConnection(function(err, connection) {
            connection.query("select * from users where email = ?", [email], function(err, rows) {
                if (err) {
                    return done(err);
                }

                if (rows.length) {
                    connection.release();
                    return done(null, false);
                }
                else {
                    // Hash password
                    password = bcrypt.hashSync(newPass, 11);

                    var newUser = {
                        email: email,
                        password: password,
                        rawPass: newPass
                    };

                    connection.query("INSERT INTO users (email, password) values (?, ?)", [email, password], function(err, rows) {
                        connection.release();

                        newUser.id = rows.insertId;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

    // Local Login
    passport.use('local-login', new LocalStrategy({
        failureRedirect: '/',
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        dbConnPool.query("SELECT * FROM users WHERE email=?", [email], function(err, rows) {
            if (err) {
                return done(err);
            }

            if (!rows.length) {
                return done(null, false);
            }

            bcrypt.compare(password, rows[0].password, function(err, res) {
                if (res) {
                    return done(null, rows[0]);
                }
                else {
                    return done(null, false);
                }
            });

        });

    }));

};