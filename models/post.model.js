const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');
const File = require('./file.model');

const Post = sequelize.define('post', {
  content: {
    type: Sequelize.TEXT
  },
  privacy: {
    type: Sequelize.ENUM('PUBLIC', 'UNIVERSITY', 'CLASSYEAR', 'PEERS', 'WORLDWIDE', 'PRIVATE'),
    defaultValue: 'PUBLIC'
  },
  nbComments: {
    type: Sequelize.VIRTUAL
  },
  nbLikes: {
    type: Sequelize.VIRTUAL
  },
  isLiked: {
    type: Sequelize.VIRTUAL
  }
});

Post.belongsTo(User, { foreignKey : 'user_id', as : 'user'});

Post.belongsTo(Post, { foreignKey : 'parent_id', as : 'post'});

Hashtag.belongsToMany(Post, {through: 'post_hashtag'});
Post.belongsToMany(Hashtag, {through: 'post_hashtag'});

File.belongsToMany(Post, {through: 'post_file'});
Post.belongsToMany(File, {through: 'post_file'});

module.exports = Post;
