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

module.exports = config;
