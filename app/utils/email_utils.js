'use strict';

var config = require('../configuration/config');

module.exports = function(mailTransporter) {
    var module = {
        mailer: mailTransporter
    };

    module.checkEmailService = function (recipient, dbErr, callback) {

        var subject = 'CocoaCouriers server started';
        var body = 'CocoaCouriers server started.<br/>';

        if (dbErr) {
            subject += ' - Database Connection Test Failed!!';
            body += ' Database connection test error: ' + dbErr;
        }
        else {
            body += ' Database connection test Successful';
        }

        var mailTemplate = this.mailer.templateSender({
            subject: config.mailOptionsTemplate.content.subject,
            html: config.mailOptionsTemplate.content.html.start + body + config.mailOptionsTemplate.content.html.end
        }, {
            from: 'info@cocoacouriers.com',
            attachments: config.mailOptionsTemplate.options.attachments
        });

        mailTemplate({
            to: recipient
        }, {
            subject: subject,
            htmlMsg: body
        }, function(err, info){
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, true);
            }
        });

    };

    module.sendNewPassword = function (recipient, newPass, callback) {

        var subject = 'Cocoa Couriers New Account Created';
        var body =
            '<h2>' +
            'Welcome to CocoaCouriers!' +
            '</h2>' +
            '<br/>' +
            '<p>' +
            'We have created a simple account for you where you can modify your information, and retrieve past orders.' +
            '<br/><br/>' +
            'Your temporary password is: <b>'+ newPass + '</b>' +
            '<br/><br/>' +
            'You can view your account here: <a href="https://cocoacouriers.com/My-Account">https://cocoacouriers.com/my-account</a><br/><br/>' +
            'You will receive an email shortly with information regarding your lasted order.<br/><br/>' +
            'Best Regards,<br/>' +
            'Cocoa Couriers' +
            '</p>';

        var mailTemplate = this.mailer.templateSender({
            subject: config.mailOptionsTemplate.content.subject,
            html: config.mailOptionsTemplate.content.html.start + body + config.mailOptionsTemplate.content.html.end
        }, {
            from: 'info@cocoacouriers.com',
            attachments: config.mailOptionsTemplate.options.attachments
        });

        mailTemplate({
            to: recipient
        }, {
            subject: subject,
            htmlMsg: body
        }, function(err, info){
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, true);
            }
        });
    };

    module.sendReceipt = function (recipient, shipmentId, products, subtotal, discount, shipping, tax, total, callback) {

        var now = new Date();
        var formattedDate = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear();

        var subject = 'Cocoa Couriers Receipt - ' + shipmentId;
        var body =
            '<div style="text-align:right;margin-bottom:20px;">' +
            '<small>' + formattedDate + '</small>' +
            '</div>' +
            '<table style="width:100%">' +
            '<thead>' +
            '<tr>' +
            '<th>' +
            '<h3>Description</h3>' +
            '</th>' +
            '<th style="text-align:right;">' +
            '<h3>Price</h3>' +
            '</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        // Add products
        for (var i = 0; i < products.length; i++) {
            body += '<tr><td>' + products[i].name + '</td><td style="text-align:right;">&times;' + products[i].quantity + '&nbsp;&nbsp;&nbsp;$ ' + (products[i].price/100).toFixed(2) + '</td></tr>';
        }

        body +=
            '<tr>' +
            '<td><hr style="opacity:0.4;"/></td>' +
            '<td><hr style="opacity:0.4;"/></td>' +
            '</tr>' +
            '<tr>' +
            '<td>Subtotal</td>' +
            '<td style="text-align:right;">$ ' + (subtotal/100).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>Discount</td>' +
            '<td style="text-align:right;">-$ ' + (discount/100).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>Shipping</td>' +
            '<td style="text-align:right;">$ ' + (shipping/100).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td>' + tax.desc + '</td>' +
            '<td style="text-align:right;">$ ' + (tax.amount/100).toFixed(2) + '</td>' +
            '</tr>' +
            '<tr>' +
            '<td><hr style=opacity:0.4;/></td>' +
            '<td><hr style=opacity:0.4;/></td>' +
            '</tr>' +
            '<tr>' +
            '<td><b>Total Paid</b></td>' +
            '<td style="text-align:right;">' +
            '<b>$ ' + (total/100).toFixed(2) + '</b>' +
            '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';

        var mailTemplate = this.mailer.templateSender({
            subject: config.mailOptionsTemplate.content.subject,
            html: config.mailOptionsTemplate.content.html.start + body + config.mailOptionsTemplate.content.html.end
        }, {
            from: 'info@cocoacouriers.com',
            attachments: config.mailOptionsTemplate.options.attachments
        });

        mailTemplate({
            to: recipient
        }, {
            subject: subject,
            htmlMsg: body
        }, function(err, info){
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, true);
            }
        });
    };

    return module;
};

this.prototype = {

};
