const graphql = require('graphql');
const { GraphQLInputObjectType, GraphQLString, GraphQLID } = graphql;

var FileInputDef = new GraphQLInputObjectType({
  name: `FileInputDef`,
  fields:  () => ({
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    bucketname: {type: GraphQLString},
    token: {type: GraphQLString},
    type: {type: GraphQLString},
    preview : { type : FileInputDef }
  })});

  module.exports = FileInputDef;
