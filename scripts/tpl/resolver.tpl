const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const {Name} = require('../defs/{name}.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `{Name}Resolver`,
  fields: {}
});
