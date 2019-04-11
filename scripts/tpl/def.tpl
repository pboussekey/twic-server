const graphql = require('graphql');
const { GraphQLObjectType } = graphql;

module.exports = new GraphQLObjectType({
  name: `{Name}Def`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString}
  }});
