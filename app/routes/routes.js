'use strict';

var serveStatic = require('serve-static');

var customerCtrl = require('../controllers/customer_ctrl');
var couponCtrl = require('../controllers/coupon_ctrl');
var planCtrl = require('../controllers/plan_ctrl');
var subscriptionCtrl = require('../controllers/subscription_ctrl');

// var chargeCtrl = require('../controllers/charge_ctrl');
// var tokenCtrl = require('../controllers/token_ctrl');

module.exports = function(app) {

    // Allow static HTML and CSS pages to be rendered =================================================================/
    app.use(serveStatic('public'));

    // ================================================================================ //
    // ================================= Static Pages ================================= //
    // ================================================================================ //

    app.get('/', function(req, res) {
        res.sendfile('./public/index.html');
    });

	app.get('/blog', function(req, res) {
		res.sendfile('./public/blog-listing.html');
	});

    app.get('/blog-item', function(req, res) {
		res.sendfile('./public/blog-detail.html');
	});

    app.get('/happy-anniversary', function(req, res) {
        res.sendfile('./public/Happy-Anniversary.html');
    });

    app.get('/the-train-knocking', function(req, res) {
        res.sendfile('./public/The-Train-Knocking.html');
        res.sendfile('./public/The-Train-Knocking.html');
    });



    // ================================================================================ //
    // ================================== API ROUTES ================================== //
    // ================================================================================ //

    // ----------------- Token Related -------------------- //

    /*
     app.get('/token', function (req, res, next) {
     tokenCtrl.get(req, res, function(result) {
     res.send(result);
     });
     });

     app.post('/token', function (req, res, next) {
     tokenCtrl.create(req, res, function(result) {
     res.send(result);
     });
     });


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
    app.get('/customer', function (req, res, next) {
        customerCtrl.get(req, res, function (result) {
            res.send(result);
        });
    });

    app.post('/customer', function (req, res, next) {
        customerCtrl.create(req, res, function (result) {
            res.send(result);
        });
    });

    app.put('/customer', function (req, res, next) {
        customerCtrl.update(req, res, function (result) {
            res.send(result);
        });
    });


    // ----------------- Plan Related ------------------------ //
    app.get('/plan', function(req, res, next) {
        planCtrl.get(req, res, function(result) {
            res.send(result);
        });
    });

    app.post('/plan', function (req, res, next) {
        planCtrl.create(req, res, function(result) {
            res.send(result);
        });
    });


    // ----------------- Subscription Related ------------------------ //

    app.get('/subscription', function (req, res, next) {
        subscriptionCtrl.get(req, res, function(result) {
            res.send(result);
        });
    });

    app.post('/subscription', function (req, res, next) {
        subscriptionCtrl.create(req, res, function(result) {
            res.send(result);
        });
    });

    app.put('/subscription', function (req, res, next) {
        subscriptionCtrl.update(req, res, function(result) {
            res.send(result);
        });
    });

    app.delete('/subscription', function (req, res, next) {
        subscriptionCtrl.cancel(req, res, function(result) {
            res.send(result);
        });
    });


    // ----------------- Coupon Related ------------------------ //
    app.get('/coupon', function (req, res, next) {

        // Check if getting one coupon or list
        if (typeof req.query.id !== 'undefined') {
            couponCtrl.get(req, res, function(result) {
                res.send(result);
            });
        }
        else {
            couponCtrl.getAll(req, res, function(result) {
                res.send(result);
            });
        }
    });

    app.post('/coupon', function (req, res, next) {
        couponCtrl.create(req, res, function(result) {
            res.send(result);
        });
    });

    app.delete('/coupon', function (req, res, next) {
        couponCtrl.remove(req, res, function(result) {
            res.send(result);
        });
    });


// TODO: IMPLEMENT WEBHOOKS FOR TAXES AND INVOICES
    /*
     You would offer your customers the ability to enter their card details and then you would follow this flow:
     * Create a customer in Stripe with the card token.
     * Create the first Invoice Item for the first invoice (always closed by default) for the tax.
     * Create the subscription to the monthly plan => automatically bills the Invoice Item created before.
     * Each month, listen for the `invoice.created` event and create a new Invoice Item for the correct amount for the tax.
     */
    // ========================= Webhooks From Stripe ============================= //

    // Listen for invoices created
    app.post('/webhooks/stripe/invoice-created', function (req, res) {
        var payload = req.body;
        res.send(200);
    });




    // ==================================================================================== //
    // ================================== ERROR HANDLING ================================== //
    // ==================================================================================== //
    // TODO: ADD 404 PAGE
    // Send to home page if no route found ============================================================================/
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });
};

