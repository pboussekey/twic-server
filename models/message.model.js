const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const File = require('./file.model');
const User = require('./user.model');
const Conversation = require('./conversation.model');

const Message = sequelize.define('message', {
  text: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.ENUM('MESSAGE', 'GROUP', 'CHANNEL'),
    defaultValue: 'MESSAGE'
  },
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

Message.beforeCreate(function(message){
  const ConversationUser = require('./conversation_user.model');
  return ConversationUser.findOne(
    {where : { user_id : message.user_id, conversation_id : message.conversation_id}}
  ).then(function(conversation_user){
    if(!conversation_user){
       return Promise.reject("Not allowed.");
    }
  });
});


module.exports = Message;
