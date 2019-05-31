const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');

const MagicLink = sequelize.define('magic_link', {
  request_token: {
    type: Sequelize.STRING
  },
  magic_token: {
    type: Sequelize.STRING
  },
  token_checked: {
    type: Sequelize.BOOLEAN,
    underscored:true,
    defaultValue: false
  },
}, { paranoid : false });

MagicLink.belongsTo(User, { foreignKey : 'user_id', as : 'user'});

module.exports = MagicLink;
