const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const {Name} = require('../defs/{name}.def');
const {Name}Model = require('../../loaders/models.js')['{Name}'];

module.exports = new GraphQLObjectType({
  name: `{Name}Resolver`,
  fields: {
    '{name}': {
      type: new GraphQLList({Name}),
      args: {id : {type: GraphQLID}},
      resolve(parent, args, context){
        return {Name}Model.get(args.id);
      }
    },
    '{name}s': {
      type: new GraphQLList({Name}),
      resolve(parent, args, context){
        return {Name}Model.getList();
      }
    }
  }
});
