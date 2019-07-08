const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');


const UserFcmToken = sequelize.define('user_fcm_token',
  {
    token: {
    type: Sequelize.STRING
    }
  },
{
  paranoid: false
});

UserFcmToken.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

UserFcmToken.removeAttribute('id');

module.exports = UserFcmToken;
