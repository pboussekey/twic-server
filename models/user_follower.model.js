const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');


const UserFollower = sequelize.define('user_follower', {},
{
  paranoid: false
});


UserFollower.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

UserFollower.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

UserFollower.removeAttribute('id');

module.exports = UserFollower;
