"use strict";

var expect = require('chai').expect;

var configPriv = require('../app/configuration/config_priv');
var sendgrid = require('sendgrid')(configPriv.sendGridKey);
var MailService = require('../app/utils/mail_service');
var mailService = new MailService(sendgrid);

var recipient = 'val@cantangosolutions.com';


describe('Test emails for proper formatting and delivery', function(){
    it('Should correctly send a startup test mail with no database test error', function(done) {
        expect(mailService.checkEmailService(recipient, false, 'PROD', function(err, result) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }));
    });
    it('Should correctly send a new password email', function(done) {
        expect(mailService.sendNewPassword(recipient, 'NEW_TEST_PASS', function(err, result) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }));
    });
    it('Should correctly send a password reset email', function(done) {
        expect(mailService.sendPasswordReset(recipient, 'RESET_TOKEN', function(err, result) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }));
    });
    it('Should correctly send a subscription registration', function(done) {
        expect(mailService.sendSubscriptionRegistration (recipient, {name: 'PLAN_NAME', inverval_count: 1}, function(err, result) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }));
    });
    it('Should correctly send a receipt registration', function(done) {
        expect(mailService.sendReceipt (recipient, 'SHIPMENT_ID', [{name: 'Product1', price: 1099, quantity: 1}, {name: 'Product2', price: 2255, quantity: 2}], 3444, 0, 500, 450, 4394, function(err, result) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }));
    });
});