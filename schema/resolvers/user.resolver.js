const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLString, GraphQLInt } = graphql;
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
          COALESCE(COUNT(DISTINCT followers.follower_id),0) as nbFollowers,
          COALESCE(COUNT(DISTINCT followings.user_id),0) as nbFollowings,
          COALESCE(COUNT(DISTINCT post.id),0) as nbPosts
          FROM
          user
          LEFT JOIN user_follower as followers ON (user.id = followers.user_id)
          LEFT JOIN user_follower as followings ON (user.id = followings.follower_id)
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
          university_id : {type : GraphQLID},
          hashtag_id : {type : GraphQLID},
          conversation_id : {type : GraphQLID},
          user_id : { type : GraphQLID},
          major_id : { type : GraphQLID},
          minor_id : { type : GraphQLID},
          class_year : { type : GraphQLInt},
          id : { type : new GraphQLList(GraphQLID)},
          count : { type : GraphQLInt},
          page : { type : GraphQLInt},
        },
        resolve(parent, args, context){
          var query =  `SELECT
          user.*,
          IF(followers.follower_id IS NOT NULL, 1, 0) > 0 as followed,
          IF(followings.user_id IS NOT NULL, 1, 0) > 0 as following
          FROM
          user
          JOIN school ON (COALESCE(user.school_id, user.university_id) = school.id)
          LEFT JOIN user_follower as followers ON (user.id = followers.user_id AND followers.follower_id = :user)
          LEFT JOIN user_follower as followings ON (user.id = followings.follower_id AND followings.user_id = :user)
          `;
          if(args.user_id && args.follower){
            query += `JOIN user_follower ON (user.id = user_follower.follower_id AND user_follower.user_id = :user_id)
            `;
          }
          else if(args.user_id && args.following){
            query += `JOIN user_follower ON (user.id = user_follower.user_id AND user_follower.follower_id = :user_id)
            `;
          }
          else if(args.conversation_id){
            query += `JOIN conversation_user ON (user.id = conversation_user.user_id AND conversation_user.conversation_id = :conversation)
            `;
          }
          if(args.hashtag_id){
            query += `JOIN hashtag_follower ON (user.id = hashtag_follower.follower_id AND hashtag_follower.hashtag_id = :hashtag)
            `;
          }
          query += `WHERE user.deleted_at IS NULL AND user.id <> :user
          ${args.search ? ' AND (LCASE(CONCAT(user.firstname,user.lastname)) LIKE :search OR LCASE(CONCAT(user.lastname, user.firstname)) LIKE :search)'  : ''}
          ${args.school_id ? ' AND user.school_id = :school' : '' }
          ${args.university_id ? ' AND (school.university_id = :university OR (school.university_id IS NULL AND school.id = :university))'  : '' }
          ${args.id && args.id.length ? ' AND user.id IN (:id)' : '' }
          ${args.major_id && !args.minor_id ? ' AND user.major_id = :major' : ''}
          ${args.minor_id && !args.major_id ? ' AND user.minor_id = :minor' : ''}
          ${args.minor_id && args.major_id ? ' AND (user.minor_id = :minor OR user.major_id = :major)' : ''}
          ${args.class_year ? ' AND user.class_year = :class_year' : ''}
          ${ !args.user_id && null !== args.follower ? 'HAVING followed = :follower' : ''}
          ${ !args.user_id && null !== args.following ? 'HAVING following = :following' : ''}
          ORDER BY user.nb_followers DESC
          LIMIT ${(args.count || 10) * (args.page || 0)},${args.count || 10}`;

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
                university : args.university_id,
                hashtag : args.hashtag_id,
                search : args.search ? args.search.replace(/\s/g,'').toLowerCase() + '%' : null,
                major : args.major_id,
                minor : args.minor_id,
                conversation : args.conversation_id,
                id : args.id,
                class_year : args.class_year
              },
              type: Db.Sequelize.QueryTypes.SELECT,
              model : Db.User,
              mapToModel : true
            });
          }
        }
      }
    });
