const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLString } = graphql;
const Hashtag = require('../defs/hashtag.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `HashtagResolver`,
  fields: {
    'hashtags': {
      type: new GraphQLList(Hashtag),
      args: {followed : {type: GraphQLBoolean}, search : {type: GraphQLString}},
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT
          hashtag.*,
          SUM(IF(hashtag_followers.follower_id = :user, 1, 0)) > 0 as followed,
          SUM(IF(hashtag_followers.follower_id IS NOT NULL, 1, 0)) as nbfollowers
          FROM
          hashtag
          LEFT JOIN hashtag_followers ON (hashtag.id = hashtag_followers.hashtag_id)
          WHERE hashtag.deleted_at IS NULL
          ${args.search ? 'AND LCASE(hashtag.name) LIKE "%:search"' : ''}
          GROUP BY hashtag.id
          ${ null !== args.followed ? 'HAVING followed = :followed' : ''}
          ORDER BY SUM(IF(hashtag_followers.follower_id IS NOT NULL, 1, 0)) DESC`,
          {
            replacements: { user: context.user.id, followed : args.followed, search : args.search ? args.search.toLowerCase() : null },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Hashtag,
            mapToModel: true
          });
        }
      }
    }
  });
