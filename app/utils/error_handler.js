'use strict';

var log = require('./logger');

var errorHandler = function() {};

errorHandler.prototype = {

    handle: function (res, err, user, requestorIP) {
        // Remove user password for logging
        if ( (typeof user !== 'undefined') && (user != null) ) {
            if (typeof user.password !== 'undefined') {
                delete user.password;
            }
        }

        if (typeof err.no_logging === 'undefined') {
            log.error(err.msg.detailed, user, requestorIP);
        }

        switch (err.type) {
            case 'app':
                res.status(err.status).send(err.msg.simplified);
                break;

            case 'stripe':
                // Send token verification error code to user
                if (err.msg.detailed.rawType === 'card_error') {
                    res.status(402).send(err.msg.detailed.code);
                }

                // All other stripe errors
                else {
                    res.status(500).send('server_error');
                }
                break;

            default:
                res.status(500).send('server_error');
                break;
        }
    }

};

module.exports = new errorHandler();
