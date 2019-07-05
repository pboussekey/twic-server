const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const User = require('./user.model');

const Notification = sequelize.define('notification', {
  text: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.ENUM('FOLLOW', 'POST', 'COMMENT', 'LIKE'),
    defaultValue: 'FOLLOW'
  },
  key: {
    type: Sequelize.STRING
  },
  last: {
    type: Sequelize.BOOLEAN,
    defaultValue:true
  },
  count: {
    type: Sequelize.VIRTUAL
  },

});


Notification.belongsTo(User, { foreignKey: {
  name : 'user_id',
  as : 'user',
  allowNull: false
}});

Notification.belongsTo(User, { foreignKey: {
  name : 'creator_id',
  allowNull: false
}});

module.exports = Notification;
