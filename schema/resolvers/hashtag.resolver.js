const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLString, GraphQLInt } = graphql;
const Hashtag = require('../defs/hashtag.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `HashtagResolver`,
  fields: {
    'hashtag': {
    type: Hashtag,
    args: { id : {type : GraphQLID}},
    resolve(parent, args, context){
      return Db.sequelize
      .query(
        `SELECT
        hashtag.*,
        SUM(IF(hashtag_follower.follower_id = :user, 1, 0)) > 0 as followed,
        SUM(IF(hashtag_follower.follower_id IS NOT NULL, 1, 0)) as nbfollowers
        FROM
        hashtag
        LEFT JOIN hashtag_follower ON (hashtag.id = hashtag_follower.hashtag_id)
        WHERE hashtag.deleted_at IS NULL AND hashtag.id = :hashtag`,
        {
          replacements: { user: context.user.id, hashtag : args.id },
          type: Db.Sequelize.QueryTypes.SELECT,
          model: Db.Hashtag,
          mapToModel: true
        }).then((hashtags) => hashtags[0]);
      }
    },
    'hashtags': {
      type: new GraphQLList(Hashtag),
      args: {
        followed : {type: GraphQLBoolean},
        search : {type: GraphQLString},
        user_id : {type : GraphQLID},
        university_id : {type : GraphQLID},
        count : { type : GraphQLInt},
        page : { type : GraphQLInt},},
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT
          hashtag.*,
          SUM(IF(hashtag_follower.follower_id = :user, 1, 0)) > 0 as followed,
          SUM(IF(hashtag_follower.follower_id IS NOT NULL, 1, 0)) as nbfollowers
          FROM
          hashtag
          LEFT JOIN hashtag_follower ON (hashtag.id = hashtag_follower.hashtag_id)
          ${args.university_id ? 'JOIN school_hashtag ON (hashtag.id = school_hashtag.hashtag_id AND school_hashtag.school_id = :university)' : ''}
          ${args.user_id ? 'JOIN hashtag_follower as followedBy ON (hashtag.id = hashtag_follower.hashtag_id AND hashtag_follower.user_id = :user_id)' : ''}
          WHERE hashtag.deleted_at IS NULL
          ${args.search ? 'AND LCASE(hashtag.name) LIKE :search' : ''}
          GROUP BY hashtag.id
          ${ null !== args.followed ? 'HAVING followed = :followed' : ''}
          ORDER BY SUM(IF(hashtag_follower.follower_id IS NOT NULL, 1, 0)) DESC
          LIMIT ${(args.count || 10) * (args.page || 0)},${args.count || 10}`,
          {
            replacements: {
              user: context.user.id,
              user_id : args.user_id,
              university: args.university_id,
              followed : args.followed,
              search : args.search ? args.search.toLowerCase() + '%' : null
            },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Hashtag,
            mapToModel: true
          });
        }
      }
    }
  });
