const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const ResultDef = require('../defs/result.def');
const FileInputDef = require('../defs/file_input.def');

function addMessage(args, context){
  return  Db.Message
    .create({
      conversation_id : args.conversation_id,
      user_id : context.user.id,
      file_id : args.file_id,
      text : args.text
    })
  .then(() => ({ success : true }))
  .catch((error) => ({ success : false, message : error}));
}

module.exports = new GraphQLObjectType({
  name: `MessageMutator`,
  fields: {
    sendMessage: {
      type : ResultDef,
      args : {
        text : { type :  GraphQLString },
        conversation_id : { type :  GraphQLID },
        attachment : { type :  FileInputDef },
      },
      resolve : (parent, args, context) => !args.attachment ? addMessage(args, context) :
      Db.File.create(args.attachment).then(function(attachment){
        args.file_id = attachment.id;
        return addMessage(args, context) ;
      })
    },
  }});
