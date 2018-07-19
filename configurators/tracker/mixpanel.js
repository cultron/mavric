const Mixpanel = require('mixpanel');
const chalk = require('chalk');

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    const mixpanelConfig = config.mixpanel;
    if (!mixpanelConfig) {
        callback();
        return;
    }

    const {token, key, debug = false, verbose = false  } = mixpanelConfig;
    const options = { 
        protocol: 'https', 
        debug,
        verbose
    };
    
    if (key) {
        options.key = key;
    }

    const mixpanel = token ? Mixpanel.init(token, options) : null;
    container.registerInstance(mixpanel, 'Mixpanel');
    callback();
};
