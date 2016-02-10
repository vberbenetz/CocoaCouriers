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

config.mailOptionsTemplate = {
    content: {
        subject: '{{subject}}',
        html: {
            start: '<div style="font-family: Arial,Helvetica Neue,Helvetica,sans-serif;">' +
                    '<div style="background:rgba(59,35,20,1);width:800px;margin:0 auto;text-align:center;">' +
                    '<a href="https://cocoacouriers.com">' +
                    '<img src="cid:cocoa_email_logo" />' +
                    '</a>' +
                    '</div>' +
                    '<br />' +
                    '<div style="text-align:center;">' +
                    '<div style="margin-top:30px;width:500px;text-align:left;display:inline-block;overflow:auto;word-wrap:normal">',

            end: '</div>' +
                    '</div>' +
                    '<hr style="margin-top:40px;margin-bottom:40px;opacity:0.4;"/>' +
                    '<div style="text-align:center;margin-bottom:30px;">' +
                    '<h5>Follow Us on Social Media</h5>' +
                    '</div>' +
                    '<div style="text-align:center">' +
                    '<a href="https://instagram.com/cocoacouriers">' +
                    '<img src="cid:instagram_logo" style="margin-left:35px;margin-right:35px;"/>' +
                    '</a>' +
                    '<a href="https://facebook.com/cocoacouriers">' +
                    '<img src="cid:facebook_logo" style="margin-left:35px;margin-right:35px;"/>' +
                    '</a>' +
                    '<a href="https://twitter.com/CocoaCouriers">' +
                    '<img src="cid:twitter_logo" style="margin-left:35px;margin-right:35px;"/>' +
                    '</a>' +
                    '<a href="https://pinterest.com/c_couriers">' +
                    '<img src="cid:pinterest_logo" style="margin-left:35px;margin-right:35px;"/>' +
                    '</a>' +
                    '</div>' +
                    '<div style="text-align:center;margin-top:30px;">' +
                    '<a href="https://cocoacouriers.com">' +
                    '<small style="opacity:0.5;">Cocoa Couriers</small>' +
                    '</a>' +
                    '</div>' +
                    '</div>'
        }
    },
    options: {
        generateTextFromHTML: true,
        attachments: [
            {
                path: __dirname + '/../../public/assets/images/email-logo-white.png',
                cid: 'cocoa_email_logo'
            },
            {
                path: __dirname + '/../../public/assets/images/social_logos/instagram_logo_30.png',
                cid: 'instagram_logo'
            },
            {
                path: __dirname + '/../../public/assets/images/social_logos/facebook_logo_30.png',
                cid: 'facebook_logo'
            },
            {
                path: __dirname + '/../../public/assets/images/social_logos/twitter_logo_30.png',
                cid: 'twitter_logo'
            },
            {
                path: __dirname + '/../../public/assets/images/social_logos/pinterest_logo_30.png',
                cid: 'pinterest_logo'
            }
        ]
    }
};

module.exports = config;
