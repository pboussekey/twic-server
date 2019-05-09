const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const Post = require('../defs/post.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `PostResolver`,
  fields: {
    posts: {
      type: new GraphQLList(Post),
      args: {user_id : {type: GraphQLID}, hashtag_id : {type: GraphQLID}, parent_id : {type: GraphQLID}},
      resolve(parent, args, context){
        var query = `SELECT
            post.*,
            SUM(IF(\`like\`.user_id = :user, 1, 0)) > 0 as isLiked,
            SUM(IF(\`like\`.user_id IS NOT NULL, 1, 0)) as nbLikes,
            SUM(IF(comment.id IS NOT NULL, 1, 0)) as nbComments
          FROM
            post
            LEFT JOIN \`like\` ON (post.id = \`like\`.post_id)
            LEFT JOIN post as comment  ON (post.id = comment.parent_id)
          `;
          if(args.user_id){
              query += `WHERE post.user_id = :user_id
              `;
          }
          else if(args.hashtag_id){

              query += `
              LEFT JOIN post_hashtags ON (post.id = post_hashtag.post_id)
              WHERE post_hashtag.hashtag_id = :hashtag
              `;
          }
          else if(args.parent_id){

              query += `
              WHERE post.parent_id = :parent
              `;
          }
          else{
            query += `
            LEFT JOIN post_hashtag ON (post.id = post_hashtag.post_id)
            LEFT JOIN hashtag_follower ON (post_hashtag.hashtag_id = hashtag_follower.hashtag_id AND hashtag_follower.follower_id = :user)
            LEFT JOIN user_follower ON (post.user_id = user_follower.user_id AND user_follower.follower_id = :user)
            WHERE post.deleted_at IS NULL AND post.parent_id IS NULL
              AND (
                post.user_id = :user
                OR hashtag_follower.follower_id IS NOT NULL
                OR user_follower.follower_id IS NOT NULL
            )
            `;
          }
          query += `GROUP BY post.id
          ORDER BY post.created_at DESC`;

        return Db.sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id, user_id : args.user_id, hashtag : args.hashtag_id, parent : args.parent_id  },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Post,
            mapToModel: true
          });
        }
      }
    }
  });
