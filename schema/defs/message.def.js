const graphql = require('graphql');
const { GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;

const UserDef = require('./user.def.js');
const FileDef = require('./file.def.js');
const Db = require('../../database/database');
const Cache = require('../../database/cache');

module.exports = new GraphQLObjectType({
  name: `MessageDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    text: {type: GraphQLString},
    createdAt: {
      type: GraphQLDateTime
    },
    conversation_id: {type:GraphQLID},
    user : {
      type : UserDef,
      resolve(parent, args){
        return Cache.get(Db.User, parent.user_id);
      }
    },
    attachment : {
      type : FileDef,
      resolve(parent, args){
        return Cache.get(Db.File, parent.file_id);
      }
    },
  }});
