const lifetime = require('sahara').lifetime;

module.exports = (container, callback) => {
    const mapping = require('./mappings');
    container.registerInstance(mapping, 'ErrorMapping', lifetime.memory());
    callback();
};
