const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const Notification = require('./notification.model');
const File = require('./file.model');

const NotificationFile = sequelize.define('notification_file', {},
{
  paranoid: false
});

NotificationFile.belongsTo(Notification, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'notification_id'
}});

NotificationFile.belongsTo(File, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'file_id'
}});

NotificationFile.removeAttribute('id');

module.exports = NotificationFile;
