const graphql = require('graphql');
const { GraphQLSchema } = graphql;
const { mergeSchemas } = require("graphql-tools");
const Resolvers = require('../loaders/resolvers');
const Mutators = require('../loaders/mutators');
const _ = require('lodash');

module.exports = mergeSchemas({
  schemas: _.keys(_.merge({}, Resolvers, Mutators)).map(key => new GraphQLSchema({ query : Resolvers[key], mutation : Mutators[key]}))
});
