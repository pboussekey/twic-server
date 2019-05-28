const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString } = graphql;
const Conversation = require('../defs/conversation.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `ConversationResolver`,
  fields: {
    'conversations': {
      type: new GraphQLList(Conversation),
      args: {type : {type: new GraphQLNonNull(GraphQLString)}, search : {type: GraphQLString}},
      resolve(parent, args, context){
        var query = `SELECT
            conversation.*,
            message.text AS last,
            message.created_at AS last_date
          FROM
            conversation
            JOIN conversation_user ON (conversation.id = conversation_user.conversation_id AND conversation_user.user_id = :user)
            JOIN (SELECT message.conversation_id, MAX(id) as id FROM message GROUP BY message.conversation_id) as last ON (conversation_user.conversation_id = last.conversation_id)
            JOIN message ON (last.id = message.id)
        `;

        if(args.search){
          switch (args.type) {
            case "MESSAGE":
                query += `
                  JOIN conversation_user AS users ON (conversation.id = conversation_user.conversation_id)
                  JOIN user ON (conversation_user.user_id = user.id AND )
                  WHERE (LCASE(CONCAT(user.firstname, " ", user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname, " ", user.firstname)) LIKE :search'
                   OR (LCASE(CONCAT(user.firstname,  user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname,  user.firstname)) LIKE :search)'
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
          switch (args.type) {
            case "MESSAGE":
                query += `
                  AND conversation.name IS NULL AND conversation.hashtag_id IS NULL
                `;
            break;
            case "GROUP":
                query += `
                  AND conversation.name IS NOT NULL AND conversation.hashtag_id IS NULL
                `;
            break;
            case "CHANNEL":
                query += `
                  AND conversation.name IS NULL AND conversation.hashtag_id IS NOT NULL
                `;
            break;

          }
        }
        query +=`
            GROUP BY conversation.id
          `;

        return Db.sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id, search : args.search },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Conversation,
            mapToModel: true
          });
        }
    }
  }
});
