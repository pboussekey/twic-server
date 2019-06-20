const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const Post = require('./post.model');
const User = require('./user.model');

const PostMention = sequelize.define('post_mention', {},
{
  paranoid: false
});


PostMention.belongsTo(Post, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'post_id',
  as : 'mentions'
}});

PostMention.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id',
  as : 'mentions'
}});

PostMention.removeAttribute('id');

module.exports = PostMention;
