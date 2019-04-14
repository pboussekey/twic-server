const DataLoader = require('dataloader');
const _ = require('lodash');


var  _cache = {};

function get(model, ids){
  if(!_cache[model.name]){
    _cache[model.name] = new DataLoader(async function(ids) {
      var result = await model.findAll({ raw: true, where : {id : ids} });
      var objects = _.groupBy(result, 'id');
      return ids.map(id => objects[id] ? objects[id][0] : null);
    });
  }
  return !ids ? null : _cache[model.name].load(ids).then(function(objects){
    return objects.length === 1 ? objects[0] : objects;
  });
};

function clear(model, id){
  if(model){
    return id ? _cache[model.name].clear(id) : _cache[model.name].clearAll();
  }
  else{
    _.forIn(_cache, cache => cache.clearAll());
  }
};

module.exports =  {get : get, clear : clear};
