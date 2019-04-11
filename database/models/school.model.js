const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const File = require('./file.model');

const School = new Model('School', {
  name: {
    type: Sequelize.STRING
  }
});

School.model.belongsTo(File.model, { foreignKey : 'logo_id', as : 'logo'});
School.model.belongsTo(School.model,{ foreignKey : 'university_id', as : 'university'});

module.exports = School;
