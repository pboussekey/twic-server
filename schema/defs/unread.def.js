const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt } = graphql;

module.exports = new GraphQLObjectType({
  name: `UnreadDef`,
  fields:  {
    MESSAGE : {type: GraphQLInt},
    GROUP : {type: GraphQLInt},
    CHANNEL : {type: GraphQLInt}
  }});
