const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLString } = graphql;
const User = require('../defs/user.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `UserResolver`,
  fields: {
    'user': {
      type: User,
      args: {id : {type: GraphQLID}},
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT
          user.*,
          SUM(IF(followers.follower_id = :user, 1, 0)) > 0 as followed,
          COUNT(DISTINCT followers.follower_id) as nbFollowers,
          COUNT(DISTINCT followings.user_id) as nbFollowings,
          COUNT(DISTINCT post.id) as nbPosts
          FROM
          user
          LEFT JOIN user_followers as followers ON (user.id = followers.user_id)
          LEFT JOIN user_followers as followings ON (user.id = followings.follower_id)
          LEFT JOIN post ON (user.id = post.user_id)
          WHERE user.deleted_at IS NULL AND user.id = :user
          AND post.deleted_at IS NULL
          GROUP BY user.id`,
          {
            replacements: { user: args.id },
            type: Db.sequelize.QueryTypes.SELECT,
          }).then((users) => users[0]);
        }
      },
      'users': {
        type: new GraphQLList(User),
        args: {
          follower : {type: GraphQLBoolean},
          following : {type : GraphQLBoolean },
          search : {type: GraphQLString},
          school_id : {type : GraphQLID},
          user_id : { type : GraphQLID}
        },
        resolve(parent, args, context){
          var query =  `SELECT
          user.*
          FROM
          user
          LEFT JOIN user_followers as followers ON (user.id = followers.user_id)
          LEFT JOIN user_followers as followings ON (user.id = followings.follower_id)
          `;
          if(args.user_id && args.follower){
            query += `JOIN user_followers ON (user.id = user_followers.follower_id AND user_followers.user_id = :user_id)
            `;
          }
          else if(args.user_id && args.following){
            query += `JOIN user_followers ON (user.id = user_followers.user_id AND user_followers.follower_id = :user_id)
            `;
          }
          query += `WHERE user.deleted_at IS NULL AND user.id <> :user
          ${args.search ? ' AND (LCASE(CONCAT(user.firstname, " ", user.lastname)) LIKE "%:search" OR LCASE(CONCAT(user.lastname, " ", user.firstname)) LIKE "%:search")'  : ''}
          ${args.school_id ? ' AND user.school_id = :school' : '' }
          GROUP BY user.id
          ${ !args.user_id && null !== args.follower ? 'HAVING followed = :follower' : ''}
          ${ !args.user_id && null !== args.following ? 'HAVING following = :following' : ''}
          ORDER BY COUNT(DISTINCT followers.follower_id) DESC
          `;

          return Db.sequelize
          .query(
            query,
            {
              replacements: {
                user: context.user.id,
                user_id : args.user_id,
                follower : args.follower,
                following : args.following,
                school : args.school_id,
                search : args.search ? args.search.toLowerCase() : null
              },
              type: Db.Sequelize.QueryTypes.SELECT,
              model : Db.User,
              mapToModel : true
            });
          }
        }
      }
    });
