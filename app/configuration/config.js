var config = {};

// Server Related
config.serverPort = 3000;

// App related values
config.coolDownPeriod = {
    day: 'friday',
    start: 3,
    end: 'first_of_next_month'
};

module.exports = config;
