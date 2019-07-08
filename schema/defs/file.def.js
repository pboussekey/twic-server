const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;
const Db = require('../../database/database');
const Cache = require('../../database/cache');

FileDef = new GraphQLObjectType({
  name: `FileDef`,
  fields:  () => ({
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    bucketname: {type: GraphQLString},
    token: {type: GraphQLString},
    type: {type: GraphQLString},
    preview : { type : FileDef,
    resolve(parent, args){
      return Cache.get(Db.File, parent.preview_id);
    } }
  })});

  module.exports = FileDef;
