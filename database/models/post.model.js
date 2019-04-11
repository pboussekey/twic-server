const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');
const File = require('./file.model');

const Post = new Model('Post', {
  content: {
    type: Sequelize.TEXT
  }
});

Post.model.belongsTo(User.model);

Post.model.belongsTo(Post.model, { foreignKey : 'post_id', as : 'comments'});

Hashtag.model.belongsToMany(Post.model, {through: 'post_hashtags'});
Post.model.belongsToMany(Hashtag.model, {through: 'post_hashtags'});

File.model.belongsToMany(Post.model, {through: 'post_files'});
Post.model.belongsToMany(File.model, {through: 'post_files'});

module.exports = Post;
