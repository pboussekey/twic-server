const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const ConversationDef = require('../defs/conversation.def');
const FileInputDef = require('../defs/file_input.def');

function _createConversation(args, context){
  return Db.Conversation.create({
    name : args.name,
    picture_id : args.picture_id
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
  console.log(args);
 return !args.picture ? _createConversation(args, context) :   Db.File.create(args.picture).then(function(picture){
      console.log("PICTURE", picture);
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
  }}});
