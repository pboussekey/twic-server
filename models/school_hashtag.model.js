const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const School = require('./school.model');
const Hashtag = require('./hashtag.model');

const SchoolHashtag = sequelize.define('school_hashtag', {},
{
  paranoid: false
});

SchoolHashtag.belongsTo(School, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'school_id'
}});

SchoolHashtag.belongsTo(Hashtag, { foreignKey: {
  allowNull: false,
  primaryKey: true,
  name : 'hashtag_id'
}});

SchoolHashtag.removeAttribute('id');

module.exports = SchoolHashtag;
