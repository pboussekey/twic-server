const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString } = graphql;

const UserDef = require('./user.def.js');
const Db = require('../../database/database');
const Cache = require('../../database/cache');

module.exports = new GraphQLObjectType({
  name: `NotificationDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    type: {type: GraphQLString},
    text: {type: GraphQLString},
    user: {type: UserDef,
    resolve(parent, args){
      return Cache.get(Db.User, parent.user_id);
    }}
}});
