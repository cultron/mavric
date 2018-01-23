module.exports = (app, schema, callback) => {
    app.get('/api/user/:id', {
        controller: 'Service',
        service: 'User',
        method: 'get',
        inputs: {
            id: schema.number().integer().greater(0)
        }
    });

    callback();
};
