const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Conversation = require('./conversation.model');
const Message = require('./message.model');
const _ = require('lodash');

const ConversationUser = sequelize.define('conversation_user',
  {},
  {paranoid : false}
);


ConversationUser.belongsTo(Message, { foreignKey: {
  allowNull: true,
  name : 'message_id'
}});

ConversationUser.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'user_id'
}});

ConversationUser.belongsTo(Conversation, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'conversation_id'
}});

ConversationUser.removeAttribute('id');

ConversationUser.get = async function(ids){
   var users = await ConversationUser.findAll({ raw : true, where : { conversation_id : ids}});
   var objects = _.groupBy(users, 'conversation_id');
   return ids.map(id => objects[id] ? objects[id] : []);
};

module.exports = ConversationUser;
