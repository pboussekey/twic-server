const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const User = require('./user.model');
const UserFollowers = new Model('User_Followers', {}, {paranoid:false});


UserFollowers.model.belongsTo(User.model, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

UserFollowers.model.belongsTo(User.model, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

UserFollowers.model.removeAttribute('id');

module.exports = UserFollowers;
