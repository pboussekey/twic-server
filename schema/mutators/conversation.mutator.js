const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const ConversationDef = require('../defs/conversation.def');
const FileInputDef = require('../defs/file_input.def');

function createConversation(args, context){
  return Db.Conversation.create({
    name : args.name,
    picture_id : args.picture_id
  })
.then(() => ({ success : true }))
.catch((error) => ({ success : false, message : error}));
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
      resolve : () => (!args.picture ? createConversation(args) :   Db.File.create(args.picture).then(function(picture){
          args.picture_id = picture.id;
          return createConversation(args, context) ;
        })).then(function(conversation){
          if(users){
            users.push(context.user.id);
            promises = [];
            users.forEach((user) => promises.push(Db.ConversationUser.create({conversation_id : conversation.id, user_id : user})));
            return Promise.all(promises).then(() => conversation);
          }
    }
  }});
