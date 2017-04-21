const fs = require('fs');
const path = require('path');
const async = require('async');

const Configurator =  (container, callback) => {
    container.registerInstance(require('goa'), 'goa');

    var configurators = [
        require('./error-handling/error-mapping'),
        require('./error-handling/express-error-handler'),
        require('./goa')
    ];

    async.eachSeries(configurators, function(configurator, next) {
        configurator(container, next);
    }, callback);
};

module.exports = {
    Configurator: Configurator,
    BaseController: require('./base-controller'),
    ServiceController: require('./service-controller')
};