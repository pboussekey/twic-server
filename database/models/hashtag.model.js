const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const Field = require('./field.model');

const Hashtag = new Model('Hashtag', {
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
