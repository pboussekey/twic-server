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
      args : {
        conversation_id : { type :  GraphQLID }
      },
      subscribe : function(parent, args, context){ console.log(`NEW_MESSAGE_${args.conversation_id}`);  return pubsub.asyncIterator(`NEW_MESSAGE_${args.conversation_id}`);},
      resolve: payload =>  payload,
    },
  }});

  Db.Message.afterCreate(function(message){
      pubsub.publish(`NEW_MESSAGE_${message.conversation_id}`, message);
  });
