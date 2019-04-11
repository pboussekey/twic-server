const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const User = require('./user.model');
const Post = require('./post.model');

const Like = new Model('Like', {}, {paranoid:false});

Like.model.belongsTo(Post.model, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

Like.model.belongsTo(User.model, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

Like.model.removeAttribute('id');

module.exports = Like;
