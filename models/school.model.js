const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const File = require('./file.model');

const School = sequelize.define('school', {
  name: {
    type: Sequelize.STRING
  },
  degree: {
    type: Sequelize.ENUM('UNIVERSITY', 'GRADUATE', 'UNDERGRADUATE'),
    defaultValue: 'UNIVERSITY'
  }
});

School.belongsTo(File, { foreignKey : 'logo_id', as : 'logo'});
School.belongsTo(School,{ foreignKey : 'university_id', as : 'university'});

module.exports = School;
