const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const File = require('./file.model');
const Hashtag = require('./hashtag.model');

const Conversation = sequelize.define('conversation', {
  name: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.ENUM('MESSAGE', 'GROUP', 'CHANNEL'),
    defaultValue: 'MESSAGE'
  },
  last: {
    type: Sequelize.VIRTUAL
  },
  lastDate: {
    type: Sequelize.VIRTUAL
  },
  lastId: {
    type: Sequelize.VIRTUAL
  },
  unread: {
    type: Sequelize.VIRTUAL
  }
});

Conversation.belongsTo(File, { foreignKey: {
  name : 'picture_id',
  allowNull: true
}});

Conversation.belongsTo(Hashtag, { foreignKey: {
  name : 'hashtag_id',
  allowNull: true,
  unique: true
}});


module.exports = Conversation;
