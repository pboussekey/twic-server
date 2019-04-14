const Sequelize = require('sequelize');
const configuration = require('../config/database');
module.exports = new Sequelize(configuration);
