'use strict';

var config = require('../configuration/config');

module.exports = class mailService {

    constructor(sendgrid) {
        this._sendgrid = sendgrid;

        // Private method to facilitate the sending of emails
        this._sendMail = function(recipient, subject, body, callback) {
            var completeEmail = config.sendGridTemplate.html.header + body + config.sendGridTemplate.html.footer;

            var newEmail = new sendgrid.Email({
                to: recipient,
                from: config.sendGridTemplate.sender.email,
                fromname: config.sendGridTemplate.sender.name,
                subject: subject,
                html: completeEmail,
                files: config.sendGridTemplate.html.attachments
            });

            this._sendgrid.send(newEmail, function(err, result) {
                if (err) {
                    return callback(err, false);
                }
                else {
                    return callback(false, result);
                }
            });
        }
    }

    checkEmailService (recipient, dbErr, env, callback) {

        // Skip sending email in dev testing
        if ( (typeof env !== 'undefined') && (env !== 'PROD') ) {
            return callback(false, true);
        }
        else {

            var subject = 'CocoaCouriers server started - ' + env;
            var body = '<br/></br>CocoaCouriers server started.<br/>';

            if (dbErr) {
                subject += ' - Database Connection Test Failed!!';
                body += 'Domain: ' + env + '<br/><br/>Database connection test error: ' + dbErr;
            }
            else {
                body += 'Domain: ' + env + '<br/><br/>Database connection test Successful';
            }

            this._sendMail(recipient, subject, body, function(err, result) {
                if (err) {
                    return callback(err, false);
                }
                else {
                    return callback(false, result);
                }
            });
        }

    };

    sendNewPassword (recipient, newPass, callback) {

        var subject = 'Cocoa Couriers New Account Created';
        var body =
            '<h2>' +
            'Welcome to CocoaCouriers!' +
            '</h2>' +
            '<br/>' +
            '<p>' +
            'We have created a simple account for you where you can modify your information, and retrieve past orders.' +
            '<br/><br/>' +
            'Your temporary password is:<br/>' + newPass +
            '<br/><br/>' +
            'You can view your account here: <a href="https://cocoacouriers.com/My-Account">https://cocoacouriers.com/my-account</a><br/><br/>' +
            'You will receive an email shortly with information regarding your lasted order.<br/><br/>' +
            'Best Regards,<br/>' +
            'Cocoa Couriers' +
            '</p>';

        this._sendMail(recipient, subject, body, function(err, result) {
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, result);
            }
        });

    };

    sendPasswordReset (recipient, resetToken, callback) {

        var subject = 'Password reset request - Cocoa Couriers';
        var body =
            '<p>A password reset request was issued for your account with this email.<br/>' +
            'Please follow the link below to reset your password.<br/><br/>' +
            '<a href="https://cocoacouriers.com/password-reset?tk=' + resetToken + '">https://cocoacouriers.com/password-reset?tk=' + resetToken + '</a><br/><br/>' +
            'If you did not request a password reset, please contact us immediately at <a href="mailto:info@cocoacouriers.com">info@cocoacouriers.com</a>';

        this._sendMail(recipient, subject, body, function(err, result) {
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, result);
            }
        });

    };

    sendSubscriptionRegistration (recipient, plan, callback) {
        var subject = 'Cocoa Couriers - Subscription Purchase';
        var body =
            '<p>Thank you for signing up for the ' + plan.name + ' subscription.<br/><br/> ';

        if (plan.interval_count > 1) {
            body += 'You will be billed every ' + plan.interval_count + ' months on the ' + config.coolDownPeriod.end + 'th of that month.<br/><br/>';
        }
        else {
            body += 'You will be billed every month on the ' + config.coolDownPeriod.end + 'th of that month.<br/>';
        }

        body +=
            'Your box will be shipped shortly afterwards, usually on the following Monday, to avoid spending the weekend at the shipping warehouse.<br/><br/>' +
            'Best Regards,<br/>' +
            'Cocoa Couriers';

        this._sendMail(recipient, subject, body, function(err, result) {
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, result);
            }
        });

    };

    sendReceipt (recipient, shipmentId, products, subtotal, discount, shipping, tax, total, callback) {

        var now = new Date();
        var formattedDate = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear();

        var subject = 'Cocoa Couriers Order - ' + shipmentId;
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

        this._sendMail(recipient, subject, body, function(err, result) {
            if (err) {
                return callback(err, false);
            }
            else {
                return callback(false, result);
            }
        });

    };

};
