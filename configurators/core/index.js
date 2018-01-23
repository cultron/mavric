'use strict';
const directory = require('./directory');
const configure = require('./run-configurators');

const Configurator = (container, callback) => {
    /**
     * List all core configurators here
     * e.g. - container.registerInstance(require('./some-local-helper'), 'some-local-helper');
     */
    container
        .registerInstance(directory, 'directory')
        .registerInstance(configure, 'configure');

    const configurators = [
        require('./log')
    ];

    configure(configurators, container, callback)
};

module.exports = {
    Configurator: Configurator,
    directory: directory,
    configure: configure
};