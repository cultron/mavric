'use strict';

module.exports = (container, callback) => {
    const app = container.resolveSync('App');
    const csurf = require('csurf');
    app.use(csurf());

    app.use((req, res, next) => {
        res.locals.csrfToken = req.csrfToken();
        next();
    });

    callback();
};