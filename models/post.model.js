const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');
const File = require('./file.model');

const Post = sequelize.define('post', {
  content: {
    type: Sequelize.TEXT
  }
});

Post.belongsTo(User, { foreignKey : 'user_id', as : 'user'});

Post.belongsTo(Post, { foreignKey : 'post_id', as : 'post'});

Hashtag.belongsToMany(Post, {through: 'post_hashtags'});
Post.belongsToMany(Hashtag, {through: 'post_hashtags'});

File.belongsToMany(Post, {through: 'post_files'});
Post.belongsToMany(File, {through: 'post_files'});

module.exports = Post;
