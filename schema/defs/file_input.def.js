const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLString, GraphQLID } = graphql;

module.exports = new GraphQLInputObjectType({
  name: `FileInputDef`,
  fields:  {
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    bucketname: {type: GraphQLString},
    token: {type: GraphQLString},
    type: {type: GraphQLString}
  }});
