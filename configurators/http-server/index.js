'use strict'

const configurator = (container, callback) => {
    const configure = container.resolveSync('configure');

    container
        .registerInstance(require('goa'), 'goa')
        .registerType(require('./service-controller'));

    const configurators = [
        require('./app'),
        //require('./middleware/csrf'),
        require('./middleware/session'),
        require('./middleware/error-handler')
    ];

    configure(configurators, container, callback);
};

module.exports = {
    Configurator: configurator,
    Listener: require('./listener'),
    BaseController: require('./base-controller')
};