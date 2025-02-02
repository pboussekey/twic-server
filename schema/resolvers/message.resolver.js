const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLInt } = graphql;
const Message = require('../defs/message.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `MessageResolver`,
  fields: {
    messages: {
      type: new GraphQLList(Message),
      args: {
        conversation_id : {type: GraphQLID},
        count : { type : GraphQLInt},
        offset : { type : GraphQLInt},
      },
      resolve(parent, args, context){
        var query = `SELECT
            message.*
          FROM
            message
            JOIN conversation_user ON (conversation_user.conversation_id = message.conversation_id AND conversation_user.user_id = :user)
          WHERE message.conversation_id = :conversation
          ORDER BY message.id DESC
          LIMIT ${(args.offset || 0)},${args.count || 10}`;

        return Db.sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id, conversation : args.conversation_id },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Message,
            mapToModel: true
          });
        }
      }
    }
});
