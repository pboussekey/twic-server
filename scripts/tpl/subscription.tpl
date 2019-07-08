const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const {Name} = require('../defs/{name}.def');
const { PubSub } = require('graphql-subscriptions');
const Db = require('../../database/database');
const pubsub = new PubSub();

module.exports = new GraphQLObjectType({
  name: `{Name}Subscription`,
  fields: {}
});
