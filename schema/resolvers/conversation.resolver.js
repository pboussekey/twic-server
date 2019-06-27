const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString } = graphql;
const Conversation = require('../defs/conversation.def');
const UnreadDef = require('../defs/unread.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `ConversationResolver`,
  fields: {
    'conversations': {
      type: new GraphQLList(Conversation),
      args: {
        id : { type : new GraphQLList(GraphQLID)},
        type : {type: GraphQLString},
        search : {type: GraphQLString}
      },
      resolve(parent, args, context){
        var query = `SELECT
            conversation.*,
            COALESCE(last.unread,0) as unread,
            message.id as last_id,
            message.text AS last,
            message.created_at AS last_date
          FROM
            conversation
            JOIN conversation_user ON (conversation.id = conversation_user.conversation_id AND conversation_user.user_id = :user)
            JOIN (
              SELECT message.conversation_id, MAX(id) as id, SUM(IF(cu.message_id IS NULL OR id > cu.message_id, 1, 0)) as unread
                  FROM message
                  LEFT JOIN conversation_user as cu ON (message.conversation_id = cu.conversation_id AND cu.user_id = :user)
                  GROUP BY message.conversation_id) as last ON (conversation_user.conversation_id = last.conversation_id)
            JOIN message ON (last.id = message.id)
        `;

        if(args.search){
          switch (args.type) {
            case "MESSAGE":
                query += `
                  JOIN conversation_user AS users ON (conversation.id = conversation_user.conversation_id)
                  JOIN user ON (conversation_user.user_id = user.id)
                  WHERE (LCASE(CONCAT(user.firstname, " ", user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname, " ", user.firstname)) LIKE :search)
                `;
            break;
            case "GROUP":
                query += `
                JOIN conversation_user AS users ON (conversation.id = conversation_user.conversation_id)
                JOIN user ON (conversation_user.user_id = user.id AND )
                WHERE (conversation.name LIKE :search OR LCASE(CONCAT(user.firstname, " ", user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname, " ", user.firstname)) LIKE :search'
                 OR LCASE(CONCAT(user.firstname,  user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname,  user.firstname)) LIKE :search)'

                `;
            break;
            case "CHANNEL":
                query += `
                  JOIN hashtag ON (conversation.hashtag_id = hashtag.id)
                  WHERE conversation.name LIKE :search
                `;
            break;

          }
        }
        if(args.type){
         query += `${!args.search ? 'WHERE' : 'AND'} conversation.type = :type
            `;
        }
        if(args.id){
            query += args.id && args.id.length ? ' WHERE conversation.id IN (:id)' : '';
        }
        query +=`
            GROUP BY conversation.id
          `;

        return Db.sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id, search : args.search, id : args.id, type : args.type },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Conversation,
            mapToModel: true
          });
        }
    },
    unread : {
      type: UnreadDef,
      resolve(parent, args, context){

            return Db.sequelize
            .query(
              `SELECT
                COALESCE(SUM(IF(conversation.name IS NULL AND conversation.hashtag_id IS NULL, conversation.unread, 0)),0) as MESSAGE,
                COALESCE(SUM(IF(conversation.name IS NOT NULL AND conversation.hashtag_id IS NULL, conversation.unread, 0)),0) as \`GROUP\`,
                COALESCE(SUM(IF(conversation.hashtag_id IS NOT NULL, conversation.unread, 0)),0) as CHANNEL
                FROM(
                  SELECT message.conversation_id, conversation.name, conversation.hashtag_id, SUM(IF(cu.message_id IS NULL OR message.id > cu.message_id, 1, 0)) as unread
                      FROM message
                      JOIN conversation ON (message.conversation_id = conversation.id)
                      LEFT JOIN conversation_user as cu ON (message.conversation_id = cu.conversation_id AND cu.user_id = :user)
                      GROUP BY message.conversation_id) as conversation

              `,
              {
                replacements: { user: context.user.id},
                type: Db.Sequelize.QueryTypes.SELECT
              }).then((unread) => unread[0]);
      }
    }
  }
});
