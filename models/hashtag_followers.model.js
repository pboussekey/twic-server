const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');


const HashtagFollowers = sequelize.define('hashtag_followers', {},
{
  paranoid: false
});

HashtagFollowers.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

HashtagFollowers.belongsTo(Hashtag, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'hashtag_id'
}});

HashtagFollowers.removeAttribute('id');

module.exports = HashtagFollowers;
