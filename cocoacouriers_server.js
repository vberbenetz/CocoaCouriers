'use strict';

var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var passport = require('passport');
var session = require('express-session');
var csurf = require('csurf');
var redisStore = require('connect-redis')(session);

var config = require('./app/configuration/config');
var configPriv = require('./app/configuration/config_priv');
var log = require('./app/utils/logger');

var app = express();

app.use(express.static('public'));

app.use(cookieParser(configPriv.cookieSecret, { httpOnly: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// ------------------------------------
// MySQL database connection pool setup
// ------------------------------------
var pool = mysql.createPool({
    connectionLimit: configPriv.mysqlConfig.connectionLimit,
    host: configPriv.mysqlConfig.host,
    user: configPriv.mysqlConfig.user,
    password: configPriv.mysqlConfig.password,
    database: configPriv.mysqlConfig.database
});


// ------------------------------------
// Passport auth
// ------------------------------------
require('./app/configuration/passport')(passport, pool);
app.use(session({
    store: new redisStore({
        host: configPriv.session.redis.host,
        port: configPriv.session.redis.port
    }),
    cookie: {
        path: '/',
        httpOnly: true,
        secure: true,      // Set to true when using HTTPS
        maxAge: (1000 * 60 * 60 * 12)  // 12 hours in milliseconds
    },
    rolling: true,  // Force cookie to be set on every response. Reset expiration of cookie
    resave: configPriv.session.resave,
    saveUninitialized: configPriv.session.saveUninitialized,
    secret: configPriv.session.sessionKey
}));
app.use(csurf());
app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});
app.use(passport.initialize());
app.use(passport.session());

// REST api routes
require('./app/routes/routes')(app, passport, pool);

// Error Handler
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Invalid CSRF token');
    }
});

log.info('================================');
log.info('====     SERVER STARTED     ====');
log.info('================================');

// Launch =============================================================================================================/
https.createServer({
    key: fs.readFileSync(configPriv.ssl.key),
    cert: fs.readFileSync(configPriv.ssl.cert),
    passphrase: configPriv.ssl.passphrase
}, app).listen(443);

// Needed for redirect to HTTPS
http.createServer(function (req, res) {
    res.writeHead(301, {'Location': 'https://' + req.headers['host'] + req.url});
    res.end();
}).listen(80);
