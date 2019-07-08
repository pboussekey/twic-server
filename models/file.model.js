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


File.preview = File.belongsTo(File, { foreignKey : 'preview_id', as : 'preview'});
module.exports = File;
