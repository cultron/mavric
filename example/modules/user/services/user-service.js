var async = require('async');

function UserService() {

}

UserService.prototype = {
    list: function(callback) {
        callback(null, [])
    },

    get: function(id, callback) {
        callback(null, { id: id });
    },

    update: function(id, data, callback) {
        callback(null, {});
    }
};

module.exports = UserService;
