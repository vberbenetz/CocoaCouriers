'use strict';

var serveStatic = require('serve-static');

var tokenCtrl = require('../controllers/token_ctrl');
var customerCtrl = require('../controllers/customer_ctrl');
var couponCtrl = require('../controllers/coupon_ctrl');
var planCtrl = require('../controllers/plan_ctrl');
var subscriptionCtrl = require('../controllers/subscription_ctrl');
var userCtrl = require('../controllers/user_ctrl');

var errorHandler = require('../utils/error_handler');

// var chargeCtrl = require('../controllers/charge_ctrl');

module.exports = function(app, passport, dbConnPool) {

    // Allow static HTML and CSS pages to be rendered =================================================================/
    app.use(serveStatic('public'));

    // ================================================================================ //
    // ================================= Static Pages ================================= //
    // ================================================================================ //

    // ======================= AUTHENTICATION ========================== //

    var auth = function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/signin');
        }
        else {
            next();
        }
    };

    app.get('/isloggedin', function(req, res) {
        res.send(req.isAuthenticated());
    });

    app.post('/login', passport.authenticate('local-login'), function(req, res) {
        res.sendStatus(200);
    });

    app.post('/logout', function(req, res) {
        req.logout();

        req.session.destroy(function(err) {
            res.send('OK');
        });
    });

    app.post('/signup', passport.authenticate('local-signup'), function(req, res) {
        res.send(req.user);
    });


    // ======================== STATIC PAGES ========================= //

    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

    app.get('/signin', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/My-Account');
        }
        else {
            res.sendfile('./public/pages/signin.html');
        }
    });

    app.get('/partners', function(req, res) {
        res.sendfile('./public/pages/partners.html');
    });

    app.get('/gift', function(req, res) {
        res.sendfile('./public/pages/gift.html');
    });

    app.get('/holiday-gift-box', function(req, res) {
        res.sendfile('./public/pages/holiday-gift-box.html');
    });

    app.get('/subscribe', function(req, res) {
        res.sendfile('./public/pages/subscribe.html');
    });

    app.get('/blog', function(req, res) {
        res.sendfile('./public/blog/blog.html');
    });

    app.get('/Cocoa-Couriers-First-Annual-Tasting-Event', function(req, res) {
        res.sendfile('./public/blog/Cocoa-Couriers-First-Annual-Tasting-Event.html');
    });

    app.get('/My-Account', auth, function(req, res) {
        res.sendfile('./public/pages/user_mgmt.html');
    });


    // ================================================================================ //
    // ================================== API ROUTES ================================== //
    // ================================================================================ //

    // ==================== APP ROUTES ========================== //

    app.get('/api/emailexists', function(req, res) {
        userCtrl.checkEmailExists(req.query.email, dbConnPool, function(err, exists) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send({exists: exists})
            }
        });
    });

    app.get('/api/user', function(req, res, next) {
        res.send( userCtrl.getUserDetails(req, res) );
    });

    app.put('/api/user', function(req, res, next) {
        if (req.query.item === 'email') {
            userCtrl.updateEmail(req, dbConnPool, function(err, updatedCustomer) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    var payload = {
                        body: {
                            connection: {
                                remoteAddress: req.connection.remoteAddress
                            },
                            item: 'email',
                            data: updatedCustomer.email,
                            customerId: updatedCustomer.stId
                        }
                    };
                    customerCtrl.update(payload, res, function (err, stCustomer) {
                        res.send(updatedCustomer);
                    })
                }
            });
        }
        else if (req.query.item === 'pass') {
            userCtrl.updatePassword(req, dbConnPool, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(200);
                }
            });
        }
        else {
            res.status(400).send('incorrect_parameter');
        }
    });


    // ==================== STRIPE ROUTES ======================= //

    // ----------------- Token Related -------------------- //

    app.get('/api/token', function (req, res, next) {
        tokenCtrl.get(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    app.post('/api/token', function (req, res, next) {
        tokenCtrl.create(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

/*
    // ----------------- Charge Related -------------------- //
    app.get('/charge', function (req, res, next) {
    chargeCtrl.get(req, res, function(result) {
    res.send(result);
    });
    });

    app.post('/charge', function (req, res, next) {
    chargeCtrl.create(req, res, function(result) {
    res.send(result);
    });
    });

    app.put('/charge', function (req, res, next) {
    chargeCtrl.update(req, res, function(result) {
    res.send(result);
    });
    });
*/

    // ----------------- Customer Related -------------------- //
    app.get('/api/customer', auth, function (req, res, next) {
        customerCtrl.get(req, res, function (err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.post('/api/customer', function (req, res, next) {

        // Create customer within Stripe
        customerCtrl.create(req, res, dbConnPool, function (err, newCustomer) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(newCustomer);
            }
        });

    });

    app.put('/api/customer', auth, function (req, res, next) {
        customerCtrl.update(req, res, function (err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ----------------- Plan Related ------------------------ //
    app.get('/api/plan', function(req, res, next) {

        if (typeof req.query.id !== 'undefined') {
            planCtrl.get(req, res, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
        else {
            planCtrl.list(req, res, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
    });


    app.post('/api/plan', function (req, res, next) {
        planCtrl.create(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ----------------- Subscription Related ------------------------ //

    app.get('/api/subscription', auth, function (req, res, next) {
        subscriptionCtrl.get(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.post('/api/subscription', auth, function (req, res, next) {
        subscriptionCtrl.create(req, res, function(err, result) {
            if (err) {
                // Attach card error code to customer
                if (typeof err.cardErrorCode !== 'undefined') {
                    req.body.item = 'metadata';
                    req.body.data = {
                        card_error_code: err.cardErrorCode
                    };
                    customerCtrl.update(req, res, function(customerErr, result) {
                        errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                    });
                }
                else {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
            }
            else {
                // Remove card error code from user because the subscription was successful
                req.body.item = 'metadata';
                req.body.data = {
                    card_error_code: null
                };
                customerCtrl.update(req, res, function(customerErr, result) {
                    res.send(result);
                });
            }
        });
    });

    app.put('/api/subscription', auth, function (req, res, next) {
        subscriptionCtrl.update(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.delete('/api/subscription', auth, function (req, res, next) {
        subscriptionCtrl.cancel(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ----------------- Coupon Related ------------------------ //
    app.get('/api/coupon', function (req, res, next) {

        // Check if getting one coupon or list
        if (typeof req.query.id !== 'undefined') {
            couponCtrl.get(req, res, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
        else {
            couponCtrl.getAll(req, res, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
    });

    app.post('/api/coupon', function (req, res, next) {
        couponCtrl.create(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.delete('/api/coupon', function (req, res, next) {
        couponCtrl.remove(req, res, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ==================================================================================== //
    // ================================== ERROR HANDLING ================================== //
    // ==================================================================================== //
    // TODO: ADD 404 PAGE
    // Send to home page if no route found ============================================================================/
/*
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });
*/

};

