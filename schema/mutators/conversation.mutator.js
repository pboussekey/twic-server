const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const ConversationDef = require('../defs/conversation.def');
const FileInputDef = require('../defs/file_input.def');

function _createConversation(args, context){
  return Db.Conversation.create({
    name : args.name,
    picture_id : args.picture_id,
    hashtag_id : args.hashtag_id
  }).then(function(conversation){
    if(args.users){
      args.users.push(context.user.id);
      return Promise.all(
        args.users.map((user) =>
          Db.ConversationUser.create(
            {conversation_id : conversation.id,
              user_id : user
            }))).then(() =>  conversation);
    }
    return conversation;
  })
.catch((error) => ({ success : false, message : error}));
}

function createConversation(args, context){
 return !args.picture ? _createConversation(args, context) :   Db.File.create(args.picture).then(function(picture){
      args.picture_id = picture.id;
      return _createConversation(args, context) ;
    });
}


module.exports = new GraphQLObjectType({
  name: `ConversationMutator`,
  fields: {
    'addConversation' : {
      type : ConversationDef,
      args : {
        name : { type :  GraphQLString },
        users : { type :  GraphQLList(GraphQLID) },
        picture : { type :  FileInputDef },
      },
      resolve : (parent, args, context) => createConversation(args, context)
  },
  'joinChannel' : {
    type : ConversationDef,
    args : {
      hashtag_id : { type :  GraphQLID },
    },
    resolve : function(parent, args, context){
      Db.HashtagFollower.findOrCreate({
        where : {
          hashtag_id : args.hashtag_id,
          follower_id : context.user.id
        }
      });
      return Db.Conversation.findOne({
        where : { hashtag_id : args.hashtag_id}
      }).then(function(conversation){
        if(conversation){
          Db.ConversationUser.create({
            conversation_id : conversation.id,
            user_id : context.user.id
          }).then(() => conversation);
        }
        else{
          args.users = [];
          return Db.Hashtag.findOne({
            id : args.hashtag_id
          }).then(function(hashtag){
            args.name = hashtag.name;
            return createConversation(args, context);
          });
        }
      });
    }},
    'createChannel' : {
      type : ConversationDef,
      args : {
        name : { type :  GraphQLString },
      },
      resolve : function(parent, args, context){
            return Db.Hashtag.findOrCreate({
              defaults : { name : args.name },
              where: Db.sequelize.where(
                Db.sequelize.fn('lower', Db.sequelize.col('name')),
                Db.sequelize.fn('lower', args.name)
              )
            }).spread(function(hashtag){
                  args.users = [];
                  args.hashtag_id = hashtag.id;
                  args.name = hashtag.name;
                  Db.HashtagFollower.findOrCreate({
                    where : {
                      hashtag_id : args.hashtag_id,
                      follower_id : context.user.id
                    }
                  });
                  return createConversation(args, context);
              });
        }
      }
  }});
