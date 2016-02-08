var config = {};

// Server Related
config.serverPort = 3000;

// App related values
/**
 * Billing Cycle Functionality:
 *
 * If customer signs up during cooldown period, they are not charged until the end of the period,
 * and the first package is lumped into the same shipping period as existing recurring customers.
 *
 * If customer signs up after cooldown period, they are charged immediately and are shipped a package.
 * They are then put into the recurring group and are charged and shipped again at the end of the cooldown period.
 *
 * Example:
 *
 * CoolDownPeriod = {
 *  start: 1,
 *  end: 15,
 * }
 *
 * Customer signs up on Jan 5th. They are not charged until January 15th and can expect the first package to arrive
 * after Jan 15.
 *
 * Customer signs up on Jan 20th. They are charged immediately and are shipped their first package right away.
 * They are then charged again on Feb 15th, at which point they are now part of the recurring customers.
 */
config.coolDownPeriod = {
    start: 1,
    end: 15
};

config.mailTemplate = {

    subject: '{{subject}}',
    text: '{{rawMsg}}',
    html: '<div><div style="background-color:#3B2314;height:100%;width=100%;text-align:center;margin-bottom:30px;"><img src="cid:cocoa_email_logo" /></div><br /><div style="text-align:center;"><div style="width:500px;text-align:left;display:inline-block;overflow:auto;word-wrap:normal">{{htmlMsg}}</div></div></div>',
    attachments: [{
        filename: 'email-logo-white.png',
        path: '../../public/assets/images',
        cid: 'cocoa_email_logo'
    }]
};

module.exports = config;
