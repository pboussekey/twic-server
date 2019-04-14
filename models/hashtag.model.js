const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const Hashtag = sequelize.define('hashtag', {
  name: {
    type: Sequelize.STRING
  },
  followed: {
    type: Sequelize.VIRTUAL
  },
  nbfollowers: {
    type: Sequelize.VIRTUAL
  }
});

module.exports = Hashtag;
