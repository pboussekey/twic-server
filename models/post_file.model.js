const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const Post = require('./post.model');
const File = require('./file.model');

const PostFile = sequelize.define('post_file', {},
{
  paranoid: false
});

PostFile.belongsTo(Post, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'post_id'
}});

PostFile.belongsTo(File, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'file_id'
}});

PostFile.removeAttribute('id');

module.exports = PostFile;
