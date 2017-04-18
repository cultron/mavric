const fs = require('fs');
const path = require('path');

module.exports = (dir, self) => {
    dir = self ? path.resolve(__dirname, '..', dir) : dir;

    return (container, callback) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                callback(err);
                return;
            }

            try {
                files
                    .filter((filename) => {
                        return /\.js$/.test(filename);
                    })
                    .forEach((filename) => {
                        container.registerType(require(path.join(dir, filename)));
                    });

                callback();
            } catch (err) {
                callback(err);
            }
        });
    };
};
