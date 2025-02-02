const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Post = require('./post.model');

const Like = sequelize.define('like', {},
{
  paranoid: false
});

Like.belongsTo(Post, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'post_id'
}});

Like.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

Like.removeAttribute('id');

module.exports = Like;
