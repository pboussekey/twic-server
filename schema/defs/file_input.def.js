const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLString } = graphql;

module.exports = new GraphQLInputObjectType({
  name: `FileInputDef`,
  fields:  {
    name: {type: GraphQLString},
    bucketname: {type: GraphQLString},
    token: {type: GraphQLString},
    type: {type: GraphQLString}
  }});
