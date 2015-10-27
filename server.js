//server.js

// Initialization =====================================================================================================/
var config = require('./config.js');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Configuration ======================================================================================================/

// setup express
app.use(bodyParser());

// Routes =============================================================================================================/
require('./app/routes.js')(app);

// Launch =============================================================================================================/
app.listen(config.serverPort);
console.log('Listening on port ' + config.serverPort);
