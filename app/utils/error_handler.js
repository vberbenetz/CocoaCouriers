'use strict';

var log = require('./logger');

var errorHandler = function() {};

errorHandler.prototype = {

    stripeHttpErrors: function (res, error, requestorIP) {
        log.error(error, requestorIP);

        if (error.code) {
            res.status(500).send(error.code);
        }
        else {
            res.status(500).send("Server Error");
        }

    },

    appErrors: function (res, errorMsg, data, requestorIP) {
        log.error(errorMsg, data, requestorIP);
        var retMsg = '';

        switch (data.httpErrorCode) {
            case 400:
                retMsg = 'Bad Request';
                break;
            case 403:
                retMsg = 'Forbidden';
                break;
            case 404:
                retMsg = 'Not Found';
                break;
            case 500:
                retMsg = 'Server Error';
                break;
            default:
                break;
        }

        res.send(data.httpErrorCode).send(errorMsg);
    }
};

module.exports = new errorHandler();
