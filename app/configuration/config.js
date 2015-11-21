var config = {};

// Server Related
config.serverPort = 3000;

// App Related
config.billingDay = 1;
config.coolDownPeriod = {
    start: 20,
    end: 'end_of_month'
};

module.exports = config;
