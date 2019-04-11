const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const User = require('./user.model');
const Hashtag = require('./hashtag.model');

const HashtagFollowers = new Model('Hashtag_Followers', {}, {paranoid:false});

HashtagFollowers.model.belongsTo(User.model, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'follower_id'
}});

HashtagFollowers.model.belongsTo(Hashtag.model, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

HashtagFollowers.model.removeAttribute('id');

module.exports = HashtagFollowers;
