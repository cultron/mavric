module.exports = function(container, callback) {
    var res = container.resolveSync('Response'),
        config = container.resolveSync('Config');

    function join(dir, file) {
        return [res.locals.config.staticBasePath, dir, file].join('/');
    }

    //set default configuration, this will be overridden by a specific application's
    //appVersion property
    res.locals.config = {
        staticBasePath: config.staticBasePath
    };

    res.locals.staticAsset = {
        css: function(file) {
            return join('css', file);
        },
        js: function(file) {
            return join('js', file);
        },
        image: function(file) {
            return join('images', file);
        },
        font: function(file) {
            return join('fonts', file);
        }
    };

    res.locals.clientConfig = {
        staticBasePath: config.staticBasePath,
        debug: !!config.clientDebug
    };

    callback();
};
