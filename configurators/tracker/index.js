//TODO: Make this more extensible to enable different tracking systems
var async = require('async');

module.exports = function(container, callback) {
    var configurators = [
        require('./mixpanel'),
        require('./tracker')
    ];

    async.eachSeries(configurators, function(configurator, next) {
        configurator(container, next);
    });

    callback();
};
