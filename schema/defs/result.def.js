const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } = graphql;

module.exports = new GraphQLObjectType({
  name: `ResultDef`,
  fields:  {
    success: {type: new GraphQLNonNull(GraphQLBoolean)},
    message : {type: GraphQLString}
  }});
