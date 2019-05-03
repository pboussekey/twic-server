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
        degree : { type :  GraphQLString },
        isActive : { type :  GraphQLBoolean },
      },
      resolve : (parent, args, context) =>
      Db.User.update({
        minor_id : args.minor_id > 0 ? args.minor_id : null,
        major_id : args.major_id > 0 ? args.major_id : null,
        school_id : args.school_id,
        classYear : args.classYear,
        degree : args.degree,
        isActive : args.isActive
      }, { where : { id : context.user.id}}).then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'An error occured'}))
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
