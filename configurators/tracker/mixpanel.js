var Mixpanel = require('mixpanel'),
    chalk = require('chalk');

module.exports = function(container, callback) {
    var config = container.resolveSync('Config'),
        token = config.mixpanelToken;

    var mixpanel = null;
    if (token) {
        mixpanel = Mixpanel.init(token);
    }

    container.registerInstance(mixpanel, 'Mixpanel');
    callback();
};
