//TODO: Make this more extensible to enable different tracking systems
const async = require('async');
const Tracker = require('./tracker');

const configurator = (container, callback) => {
    const configure = container.resolveSync('configure');
    const configurators = [
        require('./mixpanel'),
    ];

    configure(configurators, container, () => {
        container.registerType(Tracker);
        callback();
    });
};


module.exports = {
    Configurator: configurator,
    Tracker: Tracker
};