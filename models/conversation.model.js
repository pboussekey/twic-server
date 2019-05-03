const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const Conversation = sequelize.define('conversation', {
  name: {
    type: Sequelize.STRING
  },
  last: {
    type: Sequelize.VIRTUAL
  },
  lastDate: {
    type: Sequelize.VIRTUAL
  }
});

module.exports = Conversation;
