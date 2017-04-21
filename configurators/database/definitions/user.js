var Sequelize = require('sequelize');

module.exports = {
    name: 'user',
    columns: [
        {
            name: 'name',
            options: {
                type: Sequelize.STRING
            }
        }
    ],
    methods: []
};