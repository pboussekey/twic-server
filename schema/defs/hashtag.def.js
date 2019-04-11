const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLBoolean, GraphQLInt } = graphql;

module.exports = new GraphQLObjectType({
  name: `HashtagDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    followed: {type: GraphQLBoolean},
    nbfollowers: {type: GraphQLInt}
  }});
