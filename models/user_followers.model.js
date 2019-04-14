const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');


const UserFollowers = sequelize.define('user_followers', {},
{
  paranoid: false
});


UserFollowers.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

UserFollowers.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

UserFollowers.removeAttribute('id');

module.exports = UserFollowers;
