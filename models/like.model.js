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
  primaryKey: true
}});

Like.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

Like.removeAttribute('id');

module.exports = Like;
