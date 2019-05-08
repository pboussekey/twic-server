const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');


const HashtagFollower = sequelize.define('hashtag_follower', {},
{
  paranoid: false
});

HashtagFollower.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

HashtagFollower.belongsTo(Hashtag, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'hashtag_id'
}});

HashtagFollower.removeAttribute('id');

module.exports = HashtagFollower;
