const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const File = sequelize.define('file', {
    name: {
      type: Sequelize.STRING
    },
    bucketname: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    }
});

module.exports = File;
