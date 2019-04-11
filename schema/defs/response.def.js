const graphql = require('graphql');
const { GraphQLObjectType } = graphql;

module.exports = new GraphQLObjectType({
  name: `ResponseDef`,
  fields:  {
    success: {type:new GraphQLNonNull(GraphQLBoolean)},
    message: {type: GraphQLString}
  }});
