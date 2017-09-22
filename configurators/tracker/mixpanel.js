const Mixpanel = require('mixpanel');
const chalk = require('chalk');

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    const token = config.mixpanelToken;
    const mixpanel = token ? Mixpanel.init(token) : null;
    container.registerInstance(mixpanel, 'Mixpanel');
    callback();
};
