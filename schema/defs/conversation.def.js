const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLString } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;
const UserDef = require('./user.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `ConversationDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    last: {type: GraphQLString},
    lastDate: {
      type: GraphQLDateTime
    },
    users : {
      type: GraphQLList(UserDef),
      resolve(parent, args, context){
        return Db.sequelize
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
          });
    }}
  }});
