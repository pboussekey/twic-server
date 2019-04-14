const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const Field = sequelize.define('field', {
  name: {
    type: Sequelize.STRING
  }
});

module.exports = Field;
