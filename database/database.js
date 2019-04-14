const Sequelize = require('sequelize');
const configuration = require('../config/database');
const _ = require('lodash');
const glob = require("glob");
const path = require( 'path' );
const sequelize = require('./sequelize');
var db = { sequelize : sequelize, Sequelize : Sequelize };

glob.sync(`./models/*.model.js`).forEach( function( file ) {
  var value = require( path.resolve( file ) );
  var name = _.upperFirst(_.camelCase(file.replace('./models/', '').replace(`.model.js`,'')));
  db[name] = value;
});

sequelize
.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = db;
