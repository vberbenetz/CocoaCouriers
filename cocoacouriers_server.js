'use strict';

var express = require('express');
var compression = require('compression');
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

app.use(compression());
app.use(express.static('public'));

// Template rendering engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/pages');

app.use(cookieParser(configPriv.cookie.secret, { httpOnly: true, secure: true }));
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
// Mailer Setup - GMAIL OAUTH
// ------------------------------------
/*
var nodemailer = require('nodemailer');
var xoauth2Generator = require('xoauth2').createXOAuth2Generator(configPriv.gmailXOAuth2);
var mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2Generator
    }
});

var emailUtils = require('./app/utils/email_utils_legacy')(mailTransporter);
*/

// ------------------------------------
// SendGrid Mail Service Setup
// ------------------------------------
var sendgrid = require('sendgrid')(configPriv.sendGridKey);
var MailService = require('./app/utils/mail_service');
var mailService = new MailService(sendgrid);

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

// Redirect all www to non-www
app.set('trust proxy', true);
app.use( function (req, res, next) {
    if (req.headers.host.slice(0, 4) === 'www.') {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
});

// Web routes
require('./app/routes/routes')(app, passport, pool, mailService);

// Error Handler
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('Invalid CSRF token');
    }
});

// Launch =============================================================================================================/
https.createServer({
    secureProtocol: 'SSLv23_method',
    secureOptions: 'SSL_OP_NO_SSLv3'|'SSL_OP_NO_SSLv2',

    key: fs.readFileSync(configPriv.ssl.key),
    cert: fs.readFileSync(configPriv.ssl.cert),
    ca: [
        fs.readFileSync(configPriv.ssl.ca.root),
        fs.readFileSync(configPriv.ssl.ca.int1),
        fs.readFileSync(configPriv.ssl.ca.int2)
    ],
    passphrase: configPriv.ssl.passphrase,
    ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'DHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'DHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA256',
        'DHE-RSA-AES256-SHA256',
        'HIGH',
        '!aNULL',
        '!eNULL',
        '!EXPORT',
        '!DES',
        '!RC4',
        '!MD5',
        '!PSK',
        '!SRP',
        '!CAMELLIA'
    ].join(':'),
    honorCipherOrder: true
}, app).listen(configPriv.server.ssl_port);

// Needed for redirect to HTTPS
http.createServer(function (req, res) {
    res.writeHead(301, {'Location': 'https://' + req.headers['host'] + req.url});
    res.end();
}).listen(configPriv.server.http_port);


// Test database and email services on startup
var startupCtrl = require('./app/controllers/startup_ctrl');
startupCtrl.testDbConn(pool, function(err, result) {
    var dbErr = null;
    if (err) {
        dbErr = err;
        log.error('Database Startup Connection Test Failed!!!');
    }
    else {
        log.info('Database Startup Connection Test Successful');
    }
    startupCtrl.testEmail(mailService, dbErr, configPriv.env, function(err, result) {
        if (err) {
            log.error('Email Startup Test Failed!!!');
            log.error(err);
        }
        else {
            log.info('Email Startup Test Successful');
        }
    });
});

log.info('================================');
log.info('====     SERVER STARTED     ====');
log.info('================================');
