const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const File = require('./file.model');
const User = require('./user.model');
const Conversation = require('./conversation.model');

const Message = sequelize.define('message', {
  text: {
    type: Sequelize.STRING
  }
});


Message.belongsTo(File, { foreignKey: {
  name : 'file_id',
  allowNull: true
}});
Message.belongsTo(User, { foreignKey: {
  name : 'user_id',
  allowNull: false
}});
Message.belongsTo(Conversation, { foreignKey: {
  name : 'conversation_id',
  allowNull: false
}});


module.exports = Message;
