'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var passport = require('passport');
var session = require('express-session');
var redisStore = require('connect-redis')(session);

var config = require('./app/configuration/config');
var configPriv = require('./app/configuration/config_priv');
var log = require('./app/utils/logger');

// Tests
/*
var helperTests = require('./app/test/helper_test');
helperTests.findCoolDownStartAndEndDate();
*/

var app = express();

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
    resave: configPriv.session.resave,
    saveUninitialized: configPriv.session.saveUninitialized,
    secret: configPriv.session.sessionKey
}));
app.use(passport.initialize());
app.use(passport.session());



// REST api routes
require('./app/routes/routes')(app, passport, pool);

log.info('================================');
log.info('====     SERVER STARTED     ====');
log.info('================================');

// Launch =============================================================================================================/
app.listen(config.serverPort);
console.log('Listening on port ' + config.serverPort);
