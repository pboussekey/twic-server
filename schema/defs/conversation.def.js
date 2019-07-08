const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLString, GraphQLInt } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;
const UserDef = require('./user.def');
const HashtagDef = require('./hashtag.def');
const Db = require('../../database/database');
const FileDef = require('./file.def.js');
const Cache = require('../../database/cache');

module.exports = new GraphQLObjectType({
  name: `ConversationDef`,
  fields:  {
    id: {type: new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    last: {type: GraphQLString},
    type: {type: GraphQLString},
    lastDate: {
      type: GraphQLDateTime
    },
    lastId : {
      type : GraphQLID
    },
    unread : {
      type : GraphQLInt
    },
    hashtag : {
      type : HashtagDef,
      resolve(parent, args){
        return Cache.get(Db.Hashtag, parent.hashtag_id);
      }
    },
    picture : {
      type : FileDef,
      resolve(parent, args){
        return Cache.get(Db.File, parent.picture_id);
      }
    },
    users : {
      type: GraphQLList(UserDef),
      resolve(parent, args, context){
        return !parent.hashtag_id ? Db.sequelize
        .query(
          `SELECT user.*
          FROM user
          JOIN conversation_user ON (conversation_user.user_id = user.id
            AND conversation_user.conversation_id = :conversation
            AND conversation_user.user_id <> :user)
          WHERE user.deleted_at IS NULL
          `,
          {
            replacements: { conversation: parent.id,  user: context.user.id },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.User,
            mapToModel: true
          }) : null;
    }}
  }});
