'use strict';

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'log',
    streams: [{
        type: 'rotating-file',
        path: 'logs/clientLog.log',
        period: '1d'
    }]
});

var log = function() {};

log.prototype = {
    info: function(msg, data, requestorIP) {
        if (typeof requestorIP === 'undefined') {
            logger.info(msg, {RequestorIP: requestorIP});
        }
        else {
            data.requestorIP = requestorIP;
            logger.info(msg, data);
        }
    },
    warn: function(msg, data, requestorIP) {
        if (typeof requestorIP === 'undefined') {
            logger.warn(msg, {RequestorIP: requestorIP});
        }
        else {
            data.requestorIP = requestorIP;
            logger.warn(msg, data);
        }
    },
    error: function(msg, data, requestorIP) {
        if (typeof requestorIP === 'undefined') {
            logger.error(msg, {RequestorIP: requestorIP});
        }
        else {
            data.requestorIP = requestorIP;
            logger.error(msg, data);
        }
    }
};

module.exports = new log();