const sequelize = require('../sequelize');
const Sequelize = require('sequelize');
const DataLoader = require('dataloader');
const _ = require('lodash');

function abstract_model(name, fields, options){

  var model = sequelize.define(name.toLowerCase(), fields,
  _.assign({
    freezeTableName: true,
    paranoid: true,
    underscored: true
  }, options)
);

this.model = model;
this.name = name.replace("_","");
this._cache = new DataLoader(async function(ids) {
  var result = await model.findAll({ raw: true, where : {id : ids} });
  var objects = _.groupBy(result, 'id');
  console.log(ids.map(id => objects[id] ? objects[id][0] : null));
  return ids.map(id => objects[id] ? objects[id][0] : null);
});
}

abstract_model.prototype.get = function(ids){
  return !ids ? null : this._cache.load(ids).then(function(objects){
    return objects.length === 1 ? objects[0] : objects;
  }.bind(this));
};

abstract_model.prototype.getList = function(options){
  return this.model.findAll(_.assign({ raw: true }, options ));
};

abstract_model.prototype.clear = function(id){
  this._cache.clear(id);
};

abstract_model.prototype.clearAll = function(options){
  this._cache.clearAll();
};

module.exports =  abstract_model;
