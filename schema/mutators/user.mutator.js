const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt, GraphQLBoolean } = graphql;
const ResultDef = require('../defs/result.def');
const Db = require('../../database/database');
const _ = require('lodash');

module.exports = new GraphQLObjectType({
  name: `UserMutator`,
  fields: {
    updateUser : {
      type : ResultDef,
      args : {
        minor_id : { type :  GraphQLID },
        major_id : { type :  GraphQLID },
        school_id : { type :  GraphQLID },
        classYear : { type :  GraphQLInt },
        isActive : { type :  GraphQLBoolean },
      },
      resolve : (parent, args, context) =>
      Db.User.model.update({
        minor_id : args.minor_id,
        major_id : args.major_id,
        school_id : args.school_id,
        classYear : args.classYear,
        isActive : args.isActive
      }, { where : { id : context.user.id}}).then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'An error occured'}))
    },
    followUser: {
      type : ResultDef,
      args : {
        user_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.UserFollowers.model
      .create({ user_id : args.user_id, follower_id : context.user.id})
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Already followed'}))
    },

    unfollowUser: {
      type : ResultDef,
      args : {
        hashtag_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.UserFollowers.model
      .destroy({ where : { user_id : args.hashtag_id, follower_id : context.user.id} })
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Not followed'}))
    }
  }
});
