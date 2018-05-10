const Mixpanel = require('mixpanel');
const chalk = require('chalk');

module.exports = (container, callback) => {
    const config = container.resolveSync('Config');
    const token = config.mixpanelToken;
    const key = config.mixpanelApiKey;
    let options;
    if (key) {
        options = {
            key
        }
    }
    const mixpanel = token ? Mixpanel.init(token, options) : null;
    container.registerInstance(mixpanel, 'Mixpanel');
    callback();
};
