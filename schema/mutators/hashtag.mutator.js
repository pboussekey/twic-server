const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const ResultDef = require('../defs/result.def');
const _ = require('lodash');

module.exports = new GraphQLObjectType({
  name: `HashtagMutator`,
  fields: {
    followHashtag: {
      type : ResultDef,
      args : {
        hashtag_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.HashtagFollower
        .create({ hashtag_id : args.hashtag_id, follower_id : context.user.id})
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Already followed'}))
    },

    unfollowHashtag: {
      type : ResultDef,
      args : {
        hashtag_id : { type :  GraphQLID }
      },
      resolve : (parent, args, context) => Db.HashtagFollower
        .destroy({ where : { hashtag_id : args.hashtag_id, follower_id : context.user.id} })
      .then(() => ({ success : true }))
      .catch(() => ({ success : false, message : 'Not followed'}))
    }
  }
});
