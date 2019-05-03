const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

const {Name} = sequelize.define('{name}', {});

module.exports = {Name};
