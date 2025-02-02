const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const MessageDef = require('../defs/message.def');
const FileInputDef = require('../defs/file_input.def');
const Cache = require('../../database/cache');


function _createConversation(args, context){
  return Db.Conversation.create({
    name : args.name,
    picture_id : args.picture_id,
    type : args.hashtag_id ? 'CHANNEL' : (args.users.length > 1 ? 'GROUP' : 'MESSAGE')
  }).then(function(conversation){
    if(args.users){
      args.users.push(context.user.id);
      promises = [];
      args.users.forEach((user) => promises.push(Db.ConversationUser.create({conversation_id : conversation.id, user_id : user})));
      return Promise.all(promises).then(() => conversation);
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

function _createMessage(args, context){
  return  Db.Message
    .create({
      conversation_id : args.conversation_id,
      user_id : context.user.id,
      file_id : args.file_id,
      text : args.text
    })
  .then((message) => message);
}

async function createMessage(args, context, conversation) {
  if(!conversation){
    var conversation = await Cache.get(Db.Conversation, args.conversation_id);
    if(!conversation) return null;
  }
  args.type = conversation.type;
  var users = await Cache.get(Db.ConversationUser, args.conversation_id);
  if(!users.find((conversation_user) => conversation_user.user_id == context.user.id)){
    return null;
  }
  if(!args.attachment){
    return  _createMessage(args, context);
  }
  var attachment = await Db.File.create(args.attachment);
  args.file_id = attachment.id;
  return _createMessage(args, context) ;
}


module.exports = new GraphQLObjectType({
  name: `MessageMutator`,
  fields: {
    sendMessage: {
      type : MessageDef,
      args : {
        text : { type :  GraphQLString },
        conversation_id : { type :  GraphQLID },
        attachment : { type :  FileInputDef },
        name : { type :  GraphQLString },
        users : { type : GraphQLList(GraphQLID)}
      },
      resolve : function(parent, args, context){
        if(args.conversation_id){
          return createMessage(args, context);
        }
        else if(args.name){
          return createConversation(args, context).then(function(conversation){
            args.conversation_id = conversation.id;
            return createMessage(args, context);
          });
        }
        else if(args.users && args.users.length == 1){
          return Db.sequelize
          .query(
            `SELECT conversation.id
            FROM conversation
            JOIN conversation_user as me ON (conversation.id = me.conversation_id AND me.user_id = :me)
            JOIN conversation_user as other ON (conversation.id = other.conversation_id AND other.user_id = :user)
            WHERE conversation.name IS NULL`,
            {
              replacements: {
                me: context.user.id,
                user : args.users[0]
              },
              type: Db.Sequelize.QueryTypes.SELECT,
              model : Db.Conversation,
              mapToModel : true
            }).then(function(conversation){
              if(conversation[0]){
                args.conversation_id = conversation[0].id;
                return createMessage(args, context, conversation[0]);
              }
              else{
                return createConversation(args, context).then(function(conversation){
                  args.conversation_id = conversation.id;
                  return createMessage(args, context, conversation);
                });
              }
            })

        }
        else{
          return null;
        }
      }
    },
  }});
