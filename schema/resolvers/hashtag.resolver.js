const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLString } = graphql;
const Hashtag = require('../defs/hashtag.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `HashtagResolver`,
  fields: {
    'hashtags': {
      type: new GraphQLList(Hashtag),
      args: {followed : {type: GraphQLBoolean}, search : {type: GraphQLString}, user_id : {type : GraphQLID}},
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
          ${args.user_id ? 'JOIN hashtag_follower as followedBy ON (hashtag.id = hashtag_follower.hashtag_id AND hashtag_follower.user_id = :user_id)' : ''}
          WHERE hashtag.deleted_at IS NULL
          ${args.search ? 'AND LCASE(hashtag.name) LIKE :search' : ''}
          GROUP BY hashtag.id
          ${ null !== args.followed ? 'HAVING followed = :followed' : ''}
          ORDER BY SUM(IF(hashtag_follower.follower_id IS NOT NULL, 1, 0)) DESC`,
          {
            replacements: { user: context.user.id, user_id : args.user_id, followed : args.followed, search : args.search ? args.search.toLowerCase() + '%' : null },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Hashtag,
            mapToModel: true
          });
        }
      }
    }
  });
