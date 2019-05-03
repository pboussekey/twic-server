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
  allowNull: false,
  primaryKey: true
}});

ConversationUser.belongsTo(User, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

ConversationUser.belongsTo(Conversation, { foreignKey: {
  allowNull: false,
  primaryKey: true
}});

ConversationUser.removeAttribute('id');

module.exports = ConversationUser;
