'use strict';

var path = require('path');

var tokenCtrl = require('../controllers/token_ctrl');
var customerCtrl = require('../controllers/customer_ctrl');
var productCtrl = require('../controllers/product_ctrl');
var couponCtrl = require('../controllers/coupon_ctrl');
var planCtrl = require('../controllers/plan_ctrl');
var subscriptionCtrl = require('../controllers/subscription_ctrl');
var userCtrl = require('../controllers/user_ctrl');
var chargeCtrl = require('../controllers/charge_ctrl');
var manufacturerCtrl = require('../controllers/manufacturer_ctrl');
var helpers = require('../utils/helpers');
var ejs = require('ejs');

var errorHandler = require('../utils/error_handler');


module.exports = function(app, passport, dbConnPool, emailUtils) {

    // ======================= AUTHENTICATION ========================== //

    var auth = function (req, res, next) {
        if (!req.isAuthenticated()) {
            if (req.path.substring(0, 4) === '/api') {
                res.status(401).send('Unauthorized');
            }
            else {
                res.redirect('/signin');
            }
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

        // Send user their auto generated password
        emailUtils.sendNewPassword(req.user.email, req.user.rawPass, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
        });

        res.send(req.user);
    });






    // ================================================================================ //
    // ================================= Static Pages ================================= //
    // ================================================================================ //

    app.get('/', function(req, res) {
        res.sendFile( path.join(__dirname, '..', '..', 'public', 'index.html') );
    });

    app.get('/signin', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/My-Account');
        }
        else {
            res.render('signin');
        }
    });

    app.get('/partners', function(req, res) {
        res.render('partners');
    });

    app.get('/subscribe', function(req, res) {
        res.render('subscribe');
    });

    app.get('/store*', function(req, res) {
        res.render('store_index');
    });

    app.get('/blog', function(req, res) {
        res.render('blog_home');
    });

    app.get('/My-Account' , auth, function(req, res) {
        res.render('user_mgmt');
    });
    app.get('/My-Account*' , auth, function(req, res) {
        res.redirect('/My-Account');
    });



    // ========================= BLOG PAGES ============================== //

    app.get('/blog/Cocoa-Couriers-First-Annual-Tasting-Event', function(req, res) {
        res.render('blog/Cocoa-Couriers-First-Annual-Tasting-Event', {
            title: 'Cocoa Couriers First Annual Tasting Event',
            description: 'Cocoa Courier first annual chocolate tasting event'
        });
    });
    app.get('/blog/valentines-day-gift', function(req, res) {
        res.render('blog/valentines-day-gift-box', {
            title: 'Valentine\'s Day Gift Box',
            description: 'Our Cocoa Couriers valentine\'s day gift box is now available. Don\'t forget that special someone!',
            keywords: [
                'valentine\'s day',
                'gift box'
            ]
        });
    });
    app.get('/blog/free-chocolate-giveaway', function(req, res) {
        res.render('blog/free-chocolate-giveaway-contest', {
            title: 'Free chocolate givaway contest',
            description: 'A Monthly Box of Artisan Chocolate | Fair Trade | Bean to Bar | Enter for a chance to win a free box of chocolate delivered right to your door!'
        });
    });
    app.get('/blog/Why-Does-Chocolate-Cost-So-Much', function(req, res) {
        res.render('blog/why-does-chocolate-cost-so-much', {
            title: 'Why Does Chocolate Cost So Much'
        });
    });
    app.get('/blog/what-is-fair-trade', function(req, res) {
        res.render('blog/what-is-fair-trade', {
            title: 'Cocoa Couriers What Is Fair Trade',
            description: 'Learn about what fair trade means and why it\'s so important to support the fair trade cacao market! Fair Tastes Better!'
        });
    });
    app.get('/blog/whats-the-deal-with-chocolate-infusions', function(req, res) {
        res.render('blog/whats-the-deal-with-chocolate-infusions', {
            title: 'What\'s The Deal with Chocolate Infusions?',
            description: 'What\'s The Deal with Chocolate Infusions? Why are they so popular?',
            keywords: [
                'Infusions',
                'Cacao',
                'Artisan Chocolate',
                'Craft Chocolate',
                'Chocolate Box',
                'Chocolate Subscription'
            ]
        });
    });
    app.get('/blog/month-1-box', function(req, res) {
        res.render('blog/month-1-box', {
            title: 'December 2015 Box Review'
        });
    });

    // -------------------------------------------------------------------- //







    // ================================================================================ //
    // ================================== API ROUTES ================================== //
    // ================================================================================ //

    app.get('/api/emailexists', function(req, res) {
        userCtrl.checkEmailExists(req.query.email, dbConnPool, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.get('/api/user', auth, function(req, res, next) {
        res.send( userCtrl.getUserDetails(req, res) );
    });

    app.put('/api/user', auth, function(req, res, next) {
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
                    res.sendStatus(200);
                    res.sendStatus(200);
                }
            });
        }
        else {
            res.status(400).send('incorrect_parameter');
        }
    });

    app.get('/api/manufacturer', function (req, res, next) {
        manufacturerCtrl.list(dbConnPool, function(err, manufacturers) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(manufacturers);
            }
        });
    });

    app.get('/api/manufacturer/origin/list', function (req, res, next) {
        manufacturerCtrl.listOrigins(dbConnPool, function(err, origins) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(origins);
            }
        });
    });

    app.get('/api/shipping-cost', function (req, res, next) {
        var shippingCost = helpers.calculateShipping(req.query.province, req.query.country, req.query.amount);
        res.send({amount: shippingCost});
    });

    app.get('/api/tax-info', function (req, res, next) {
        var tax = helpers.calculateTaxPercentage(req.query.province);
        res.send(tax);
    });


    // ==================== STRIPE ROUTES ======================= //

    // ----------------- Token Related -------------------- //

    app.get('/api/token', function (req, res, next) {
        var tokenId = req.query.id;

        tokenCtrl.get(tokenId, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    app.post('/api/token', function (req, res, next) {
        var payload = {
            name: req.body.name,
            number: req.body.number,
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            cvc: req.body.cvc,
            address_zip: req.body.address_zip
        };

        tokenCtrl.create(payload, req.connection.remoteAddress, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ----------------- Charge Related -------------------- //
    app.post('/api/charge', auth, function (req, res, next) {

        // Verify request body correct
        if ( (!req.body.cart) || (!req.body.metadata) ) {
            res.status(400).send('bad_request');
        }
        else {
            // Retrieve customer data
            customerCtrl.get(req.user.stId, dbConnPool, function(err, customer) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    chargeCtrl.oneTimeCharge(customer, req.body.uc, req.body.source, req.body.altShipping, req.body.cart, req.body.metadata, dbConnPool, emailUtils, req.connection.remoteAddress, function(err, result) {
                        if (err) {
                            errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                        }
                        else {
                            res.send(result);
                        }
                    });

                }
            });
        }
    });


    // ----------------- Customer Related -------------------- //
    app.get('/api/customer', auth, function (req, res, next) {
        var stId = req.user.stId;

        customerCtrl.get(stId, dbConnPool, function (err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.get('/api/legacy/customer', auth, function (req, res, next) {
        var customerId = req.user.stId;

        // Customer has no information associated with them
        if (customerId === null) {
            res.status(404).send();
        }

        customerCtrl.getLegacy(customerId, function (err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.get('/api/customer/source', auth, function (req, res, next) {
        var stId = req.user.stId;

        if (req.query.sourceId) {
            customerCtrl.getSourceById(stId, req.query.sourceId, dbConnPool, function (err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
        else {
            customerCtrl.getSources(stId, dbConnPool, function (err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }

    });

    app.get('/api/customer/altShippingAddr', auth, function (req, res, next) {
        var stId = req.user.stId;

        customerCtrl.getAltShippingAddress(stId, dbConnPool, function(err, altShippingAddr) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(altShippingAddr);
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

    app.post('/api/legacy/customer', function (req, res, next) {

        // Create customer within Stripe
        customerCtrl.createLegacy(req, res, dbConnPool, function (err, newCustomer) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(newCustomer);
            }
        });
    });

    app.post('/api/customer/altShippingAddr', auth, function (req, res, next) {

        customerCtrl.addAltShippingAddress (req.body.shipping, req.user.stId, dbConnPool, req.connection.remoteAddress, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.put('/api/customer', auth, function (req, res, next) {
        customerCtrl.update(req, res, dbConnPool, function (err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });


    // ----------------- Product Related ---------------------- //
    app.get('/api/product', function (req, res, next) {
        if (req.query.productId) {
            productCtrl.getById(req.query.productId, dbConnPool, function(err, product) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(product);
                }
            });
        }
        else if (req.query.urlSubPath) {
            productCtrl.getByUrlSubPath(req.query.urlSubPath, dbConnPool, function(err, product) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(product);
                }
            })
        }
        else {
            res.status(400).send('bad_request');
        }
    });

    app.get('/api/product/list', function (req, res, next) {
        productCtrl.list(dbConnPool, function(err, products) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(products);
            }
        })
    });

    app.get('/api/product/filter', function(req, res, next) {

        var conditions = {
            manufacturers: [],
            manufacturerOrigins: [],
            cocoaOrigins: [],
            productTypes: [],
            flavorProfiles: [],
            dietaryProfiles: []
        };

        if (req.query.mid) {
            if (Array.isArray(req.query.mid)) {
                for (var i = 0; i < req.query.mid.length; i++) {
                    conditions.manufacturers.push( parseInt(req.query.mid[i]) );
                }
            }
            else {
                conditions.manufacturers.push( parseInt(req.query.mid) );
            }
        }
        if (req.query.mo) {
            if (Array.isArray(req.query.mo)) {
                for (var j = 0; j < req.query.mo.length; j++) {
                    conditions.manufacturerOrigins.push(req.query.mo[j]);
                }
            }
            else {
                conditions.manufacturerOrigins.push(req.query.mo);
            }
        }
        if (req.query.co) {
            if (Array.isArray(req.query.co)) {
                for (var k = 0; k < req.query.co.length; k++) {
                    conditions.cocoaOrigins.push(req.query.co[k]);
                }
            }
            else {
                conditions.cocoaOrigins.push(req.query.co);
            }
        }
        if (req.query.pt) {
            if (Array.isArray(req.query.pt)) {
                for (var l = 0; l < req.query.pt.length; l++) {
                    conditions.productTypes.push(req.query.pt[l]);
                }
            }
            else {
                conditions.productTypes.push(req.query.pt);
            }
        }
        if (req.query.fp) {
            if (Array.isArray(req.query.fp)) {
                for (var o = 0; o < req.query.fp.length; o++) {
                    conditions.flavorProfiles.push(req.query.fp[o]);
                }
            }
            else {
                conditions.flavorProfiles.push(req.query.fp);
            }
        }
        if (req.query.dp) {
            if (Array.isArray(req.query.dp)) {
                for (var p = 0; p < req.query.dp.length; p++) {
                    conditions.dietaryProfiles.push(req.query.dp[p]);
                }
            }
            else {
                conditions.dietaryProfiles.push(req.query.dp);
            }
        }

        productCtrl.listByFilter(conditions, dbConnPool, function(err, result) {
            if (err) {
                res.send(err);
            }
            else {
                res.send(result);
            }
        });
    });

    app.get('/api/product/list/byType', function (req, res, next) {
        productCtrl.listByProductType(req.query.productTypeId, dbConnPool, function(err, products) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(products);
            }
        })
    });

    app.get('/api/product/origin/list', function (req, res, next) {
        productCtrl.listCocoaOrigins(dbConnPool, function(err, origins) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(origins);
            }
        });
    });

    // Get product profiles corresponding to product
    app.get('/api/product/profiles', function (req, res, next) {
        if (!req.query.productId) {
            res.status(400).send('bad_request');
        }

        productCtrl.getProductProfiles(dbConnPool, req.query.productId, function(err, productProfiles) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(productProfiles);
            }
        });
    });

    // Get a list of all product profiles
    app.get('/api/profiles/list', function (req, res, next) {
        productCtrl.listProfiles(dbConnPool, function(err, profiles) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(profiles);
            }
        });
    });


    // ----------------- Plan Related ------------------------ //
    app.get('/api/plan', function(req, res, next) {

        if (typeof req.query.id !== 'undefined') {
            planCtrl.get(req.query.id, function(err, result) {
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

    app.post('/api/plan', auth, function (req, res, next) {

        if ( (typeof req.user !== 'undefined') && (typeof req.user.email !== 'undefined') ) {
            if (req.user.email !== 'val@cantangosolutions.com') {
                res.status(403).send('Forbidden');
            }
            else {
                var payload = {
                    id: req.body.id,
                    amount: req.body.amount,
                    currency: req.body.currency,
                    interval: req.body.interval,
                    interval_count: req.body.interval_count,
                    name: req.body.name,
                    metadata: req.body.metadata
                };

                planCtrl.create(payload, req.connection.remoteAddress, function(err, result) {
                    if (err) {
                        errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                    }
                    else {
                        res.send(result);
                    }
                });
            }
        }
        else {
            res.status(403).send('Forbidden');
        }

    });

    // ----------------- Subscription Related ------------------------ //

    app.get('/api/subscription', auth, function (req, res, next) {

        var customerId = req.user.stId;
        var subscriptionId = req.query.subscriptionId;

        subscriptionCtrl.get(customerId, subscriptionId, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.post('/api/subscription', auth, function (req, res, next) {
        // Verify request body correct
        if ( (!req.body.uc) || (!req.body.planId) ) {
            res.status(400).send('bad_request');
        }
        else {
            // Retrieve customer data
            customerCtrl.get(req.user.stId, dbConnPool, function(err, customer) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    subscriptionCtrl.create(customer, req.body.uc, req.body.planId, req.body.altShippingId, req.body.couponId, dbConnPool, req.connection.remoteAddress, function(err, result) {
                        if (err) {
                            errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                        }
                        else {
                            res.send(result);
                        }
                    });
                }
            });
        }

        subscriptionCtrl.create(req.user.stId, req.body.plan, req.body.coupon, req.connection.remoteAddress, function(err, result) {
            if (err) {
                // Attach card error code to customer
                if (typeof err.cardErrorCode !== 'undefined') {
                    req.body.item = 'metadata';
                    req.body.data = {
                        card_error_code: err.cardErrorCode
                    };
                    customerCtrl.updateLegacy(req, res, function(customerErr, result) {
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
                customerCtrl.updateLegacy(req, res, function(customerErr, result) {
                    res.send(result);
                });
            }
        });
    });

    app.put('/api/subscription', auth, function (req, res, next) {
        subscriptionCtrl.update(req.user.stId, req.query.newPlanId, req.connection.remoteAddress, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.delete('/api/subscription', auth, function (req, res, next) {
        var customerId = req.user.stId;
        var subscriptionId = req.query.subscriptionId;

        subscriptionCtrl.cancel(customerId, subscriptionId, req.connection.remoteAddress, function(err, result) {
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
            couponCtrl.get(req.query.id, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
        else {
            couponCtrl.getAll(req.query.limit, req.query.cursor, function(err, result) {
                if (err) {
                    errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
                }
                else {
                    res.send(result);
                }
            });
        }
    });
/*
    app.post('/api/coupon', function (req, res, next) {

        var payload = {
            id: req.body.id,
            duration: req.body.duration,
            percent_off: req.body.percentOff
        };

        // Check if expiry date for coupon passed in
        if (typeof req.body.reedemBy !== 'undefined') {
            payload.redeem_by = req.body.redeemBy;
        }

        // Check if redemption frequency passed in
        if (typeof req.body.maxRedemptions !== 'undefined') {
            payload.max_redemptions = req.body.maxRedemptions;
        }

        couponCtrl.create(payload, req.connection.remoteAddress, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });

    app.delete('/api/coupon', function (req, res, next) {

        var couponId = req.query.id;

        couponCtrl.remove(couponId, req.connection.remoteAddress, function(err, result) {
            if (err) {
                errorHandler.handle(res, err, req.user, req.connection.remoteAddress);
            }
            else {
                res.send(result);
            }
        });
    });
*/

    // ==================================================================================== //
    // ================================== ERROR HANDLING ================================== //
    // ==================================================================================== //
    // TODO: ADD 404 PAGE
    // Send to home page if no route found ============================================================================/

    app.get('*', function(req, res) {
        res.redirect('/');
    });


};

