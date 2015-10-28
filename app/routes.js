// app.routes.js

var serveStatic = require('serve-static');

module.exports = function(app) {

    // Allow static HTML and CSS pages to be rendered =================================================================/
    app.use(serveStatic('public'));

    // Home Page ======================================================================================================/
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

    app.get('//the-train-knocking', function(req, res) {
        res.sendfile('./public//The-Train-Knocking.html');
    });


    // TODO: ADD 404 PAGE
    // Send to home page if no route found ============================================================================/
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });
};

