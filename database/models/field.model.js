const Sequelize = require('sequelize');
const Model = require('./abstract_model');

const Field = new Model('Field', {
  name: {
    type: Sequelize.STRING
  }
});


module.exports = Field;
