const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const MessageDef = require('../defs/message.def');
const { PubSub } = require('graphql-subscriptions');
const Db = require('../../database/database');

const pubsub = new PubSub();

module.exports = new GraphQLObjectType({
  name: `ConversationSubscription`,
  fields: {
    onMessage: {
      type : MessageDef,
      subscribe : function(parent, args, context){
          return pubsub.asyncIterator(`MESSAGE_USER_${context.user.id}`);
        },
      resolve: payload =>  payload,
    },
    onConversationMessage: {
      type : MessageDef,
      args : {
        conversation_id : { type :  GraphQLID }
      },
      subscribe : function(parent, args, context){
          return Db.ConversationUser.findOne({
            where : { user_id : context.user.id, conversation_id : args.conversation_id}
          }).then((conversation_user) => conversation_user ? pubsub.asyncIterator(`NEW_MESSAGE_${args.conversation_id}`) : null)
        },
      resolve: payload =>  payload,
    },
  }});

  Db.Message.afterCreate(function(message){
      pubsub.publish(`NEW_MESSAGE_${message.conversation_id}`, message);
      Db.ConversationUser.findAll({ where : { conversation_id : message.conversation_id}})
        .then(function(conversation_users){
          conversation_users.forEach(function(conversation_user){
            console.log("NEW MESSAGE", conversation_user);
              pubsub.publish(`MESSAGE_USER_${conversation_user.user_id}`, message);
          });
      });
  });
