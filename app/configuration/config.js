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

/**
 * Vacation Period is when all persons who subscribe will be registered but not charged until the end.
 * Behind the scenes, the user is put on a trial until the end period.
 *
 * Month and Day both start at 1.
 *
 * In the case of less than 1, it will be set to the 1st month or day respectively.
 * In the case of greater than 12 for month or greater than number of days in current month, it will be set to max respectively.
 * In the case of end date being less than start date, this will indicate that the vacation period rolls over a calendar year.
 *
 * @type {{start: {month: number, day: number}, end: {month: number, day: number}}}
 */
config.vacationPeriod = {
    start: {
        month: 6,
        day: 1
    },
    end: {
        month: 10,
        day: 15
    }
};

// Cost of item at which shipping becomes free (amount in cents)
config.freeShippingCutoff = 5000;

config.mailOptionsTemplate = {
    content: {
        subject: '{{subject}}',
        html: {
            start: '<div style="font-family: Arial,Helvetica Neue,Helvetica,sans-serif;">' +
                    '<div style="background:#ecf0f1;width:800px;margin:0 auto;text-align:center;">' +
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
                    '<div style=text-align:center;margin-bottom:30px;>' +
                    '<h4>Have Questions or need help? Please contact us <a href="mailto:info@cocoacouriers.com" style="text-decoration:none;">info@cocoacouriers.com</a></h4>' +
                    '</div>' +
                    '<div style="text-align:center;margin-bottom:30px;">' +
                    '<h4>Follow Us on Social Media</h4>' +
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
                    '<a href="https://pinterest.com/cocoacouriers">' +
                    '<img src="cid:pinterest_logo" style="margin-left:35px;margin-right:35px;"/>' +
                    '</a>' +
                    '</div>' +
                    '<div style="text-align:center;margin-top:30px;">' +
                    '<a href="https://cocoacouriers.com" style="text-decoration:none;">Cocoa Couriers</a>' +
                    '</div>' +
                    '</div>'
        }
    },
    options: {
        generateTextFromHTML: true,
        attachments: [
            {
                path: __dirname + '/../../public/assets/images/email-logo.png',
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

config.sendGridTemplate = {
    sender: {
        name: 'CocoaCouriers Team',
        email: 'team@cocoacouriers.com'
    },
    html: {
        header: '<div style="font-family: Arial,Helvetica Neue,Helvetica,sans-serif;">' +
                '<div style="background:#ecf0f1;width:800px;margin:0 auto;text-align:center;">' +
                '<a href="https://cocoacouriers.com">' +
                '<img src="cid:cocoa_email_logo" />' +
                '</a>' +
                '</div>' +
                '<br />' +
                '<div style="text-align:center;">' +
                '<div style="margin-top:30px;width:500px;text-align:left;display:inline-block;overflow:auto;word-wrap:normal">',

        footer: '</div>' +
                '</div>' +
                '<hr style="margin-top:40px;margin-bottom:40px;opacity:0.4;"/>' +
                '<div style=text-align:center;margin-bottom:30px;>' +
                '<h4>Have Questions or need help? Please contact us <a href="mailto:info@cocoacouriers.com" style="text-decoration:none;">info@cocoacouriers.com</a></h4>' +
                '</div>' +
                '<div style="text-align:center;margin-bottom:30px;">' +
                '<h4>Follow Us on Social Media</h4>' +
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
                '<a href="https://pinterest.com/cocoacouriers">' +
                '<img src="cid:pinterest_logo" style="margin-left:35px;margin-right:35px;"/>' +
                '</a>' +
                '</div>' +
                '<div style="text-align:center;margin-top:30px;">' +
                '<a href="https://cocoacouriers.com" style="text-decoration:none;">Cocoa Couriers</a>' +
                '</div>' +
                '</div>',

        attachments: [
            {
                path: __dirname + '/../../public/assets/images/email-logo.png',
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
