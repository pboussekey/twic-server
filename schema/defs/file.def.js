const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;

module.exports = new GraphQLObjectType({
  name: `FileDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    bucketname: {type: GraphQLString},
    token: {type: GraphQLString}
  }});
