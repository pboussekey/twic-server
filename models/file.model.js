const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');

const File = sequelize.define('file', {
    name: {
      type: Sequelize.STRING
    },
    bucketname: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    }
});


module.exports = File;
