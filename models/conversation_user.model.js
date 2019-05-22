const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');
const Conversation = require('./conversation.model');
const Message = require('./message.model');

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

module.exports = ConversationUser;
