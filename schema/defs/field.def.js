const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;

module.exports = new GraphQLObjectType({
  name: `FieldDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString}
  }});
