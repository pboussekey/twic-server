const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt, GraphQLBoolean } = graphql;
const ResultDef = require('../defs/result.def');
const UserDef = require('../defs/user.def');
const FileInputDef = require('../defs/file_input.def');
const Db = require('../../database/database');
const Cache = require('../../database/cache');
const _ = require('lodash');

function updateUser(args, context){
  var fields = {
    minor_id : args.minor_id > 0 ? args.minor_id : null,
    major_id : args.major_id > 0 ? args.major_id : null,
    school_id : args.school_id,
    classYear : args.classYear,
    degree : args.degree,
    firstname : args.firstname,
    lastname : args.lastname,
    description : args.description,
    avatar_id : args.avatar_id,
    isActive : args.isActive
  };
  if(null == args.minor_id){
    delete(fields.minor_id);
  }
  if(null == args.major_id){
    delete(fields.major_id);
  }
  return  Db.User.update(fields,{ where : { id : context.user.id}}).then(function(){
      Cache.clear(Db.User, context.user.id);
      return Cache.get(Db.User, context.user.id);
  })
  .catch(() => null);
}

module.exports = new GraphQLObjectType({
  name: `UserMutator`,
  fields: {
    updateUser : {
      type : UserDef,
      args : {
        minor_id : { type :  GraphQLID },
        major_id : { type :  GraphQLID },
        school_id : { type :  GraphQLID },
        classYear : { type :  GraphQLInt },
        degree : { type :  GraphQLString },
        firstname : { type :  GraphQLString },
        lastname : { type :  GraphQLString },
        description : { type :  GraphQLString },
        isActive : { type :  GraphQLBoolean },
        avatar : { type : FileInputDef }
      },
      resolve : function(parent, args, context){
        return !args.avatar ?
          updateUser(args, context) :
          Db.File.create(args.avatar).then(function(avatar){
            args.avatar_id = avatar.id;
            return updateUser(args, context) ;
          });
      }

    },
    followUser: {
      type : ResultDef,
      args : {
        user_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.UserFollower
      .create({ user_id : args.user_id, follower_id : context.user.id})
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Already followed'}))
    },

    unfollowUser: {
      type : ResultDef,
      args : {
        hashtag_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.UserFollower
      .destroy({ where : { user_id : args.hashtag_id, follower_id : context.user.id} })
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Not followed'}))
    }
  }
});
