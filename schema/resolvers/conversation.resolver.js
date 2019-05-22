const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const Conversation = require('../defs/conversation.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `ConversationResolver`,
  fields: {
    'conversations': {
      type: new GraphQLList(Conversation),

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

        return Db.sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Conversation,
            mapToModel: true
          });
        }
    }
  }
});
