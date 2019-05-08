const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const Post = require('./post.model');
const Hashtag = require('./hashtag.model');

const PostHashtag = sequelize.define('post_hashtag', {},
{
  paranoid: false
});


PostHashtag.belongsTo(Post, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'post_id'
}});

PostHashtag.belongsTo(Hashtag, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'hashtag_id'
}});

PostHashtag.removeAttribute('id');

module.exports = PostHashtag;
