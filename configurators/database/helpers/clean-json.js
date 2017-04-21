var extend = require('extend');

function cleanJson(object, blacklist) {
    blacklist = blacklist || [];

    function cleanObject(object) {
        if (Array.isArray(object)) {
            return object.map(function(item) {
                return cleanObject(item);
            });
        }

        if (object instanceof Date) {
            return object;
        }
        if (object instanceof RegExp) {
            return object;
        }

        if (object && typeof(object) === 'object') {
            var newObject = extend({}, object);

            //handle keys directly on the object
            blacklist.forEach(function(key) {
                if (key in newObject) {
                    delete newObject[key];
                }
            });

            //make sure nested objects are clean as well
            Object.keys(newObject).forEach(function(key) {
                var value = newObject[key];
                if (value && typeof(value) === 'object') {
                    newObject[key] = cleanObject(value);
                }
            });

            return newObject;
        }

        return object;
    }

    return cleanObject(object);
}

module.exports = cleanJson;
