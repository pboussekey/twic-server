const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const File = require('./file.model');

const School = sequelize.define('school', {
  name: {
    type: Sequelize.STRING
  }
});

School.belongsTo(File, { foreignKey : 'logo_id', as : 'logo'});
School.belongsTo(School,{ foreignKey : 'university_id', as : 'university'});

module.exports = School;
