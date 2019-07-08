const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const Hashtag = sequelize.define('hashtag', {
  name: {
    type: Sequelize.STRING
  },
  followed: {
    type: Sequelize.VIRTUAL
  },
  nbFollowers: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
});

module.exports = Hashtag;
