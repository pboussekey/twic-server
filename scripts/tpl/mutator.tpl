const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const {Name}Def = require('../defs/{name}.def');
const _ = require('lodash');

module.exports = new GraphQLObjectType({
  name: `{Name}Mutator`,
  fields: () => {
    var fields = {}.toString.call({Name}Def._fields) === '[object Function]' ? {Name}Def._fields() : {Name}Def._fields;
    var addArgs = {};
    var updateArgs = { id : {type:new GraphQLNonNull(GraphQLID)}};
    _.forIn(fields, (arg, field) => {
      if(arg.type.toString() == GraphQLString.toString() || arg.type.toString() == GraphQLNonNull(GraphQLString).toString()){
        addArgs[field] = { type : arg.type };
        updateArgs[field] = { type : GraphQLString };
      }
      if(arg.type.toString().endsWith('Def') || arg.type.toString().endsWith('Def!')){
        addArgs[`${field}_id`] = { type : arg.type.toString().endsWith('Def!') ? GraphQLNonNull(GraphQLID) : GraphQLID };
        updateArgs[`${field}_id`] = { type : GraphQLID };
      }
    });
    return {
      add{Name}: {
        type : {Name}Def,
        args : addArgs,
        resolve : (parent, args) =>  Db.{Name}.create(args)
      },
      update{Name}: {
        type : GraphQLInt,
        args : updateArgs,
        resolve : (parent, args) =>  Db.{Name}.update(args, { where : { id : args.id }}).then(([affectedCount]) => { {Name}.clear(args.id); return affectedCount; })
      }
    };
  }});
