const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const School = require('./school.model');
const Field = require('./field.model');


const SchoolField = sequelize.define('school_field', {},
{
  paranoid: false
});

SchoolField.belongsTo(School, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'school_id'
}});

SchoolField.belongsTo(Field, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'field_id'
}});

SchoolField.removeAttribute('id');

module.exports = SchoolField;
