'use strict';
const Configurator = (container, callback) => {
    /**
     * List all helpers here
     * e.g. - container.registerInstance(require('./some-local-helper'), 'some-local-helper');
     */
    container.registerInstance(require('./directory'), 'directory');
    callback();
};

module.exports = {
    Configurator: Configurator,
    Directory: require('./directory')
};