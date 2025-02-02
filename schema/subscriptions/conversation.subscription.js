const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const MessageDef = require('../defs/message.def');
const { PubSub } = require('graphql-subscriptions');
const Db = require('../../database/database');
const Fcm = require('../../services/fcm.js');
const Cache = require('../../database/cache.js');
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
      Cache.get(Db.User, message.user_id).then(function(user){
        message.dataValues.user = { id : user.id, firstname : user.firstname, lastname : user.lastname };
        Db.ConversationUser.findAll({ where : { conversation_id : message.conversation_id}})
          .then(function(conversation_users){
            Db.UserFcmToken.findAll({ where : { user_id : conversation_users.map((cu) => cu.user_id)}})
            .then(function(fcm_tokens){
              var ntf = {
                  registration_ids: fcm_tokens.map((fcm_token) => fcm_token.token),
                  notification: {
                        title: user.firstname + ' ' + user.lastname,
                        body: message.text || 'Send a file'
                  },
                  data: {
                      "type" : "Message",
                      "data" : JSON.stringify(message),
                      "click_action": "FLUTTER_NOTIFICATION_CLICK",
                  }
              };
              Fcm.send(ntf, function(err, response){
                  if (err) {
                      console.log("Something has gone wrong!",err, response);
                  } else {
                      console.log("Successfully sent with response: ", response.results[0]);
                  }
              });
            });
            conversation_users.forEach(function(conversation_user){
                pubsub.publish(`MESSAGE_USER_${conversation_user.user_id}`, message);
            });
        });
      });

  });
