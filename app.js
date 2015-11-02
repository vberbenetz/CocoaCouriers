'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./app/config');
var log = require('./app/utils/logger');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// REST api routes
require('./app/routes/routes')(app);

log.info('================================');
log.info('====     SERVER STARTED     ====');
log.info('================================');

// Launch =============================================================================================================/
app.listen(config.serverPort);
console.log('Listening on port ' + config.serverPort);
