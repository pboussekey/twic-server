const Sequelize = require('sequelize');
const Model = require('./abstract_model');

const File = new Model('File', {
  name: {
    type: Sequelize.STRING
  },
  bucketname: {
    type: Sequelize.STRING
  },
  token: {
    type: Sequelize.STRING
  },
});

module.exports = File;
