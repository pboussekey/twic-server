const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const Models = require('../../loaders/models.js');
const Post = require('../defs/post.def');
const Sequelize = require('../../database/sequelize');

module.exports = new GraphQLObjectType({
  name: `PostResolver`,
  fields: {
    posts: {
      type: new GraphQLList(Post),
      args: {user_id : {type: GraphQLID}, hashtag_id : {type: GraphQLID}},
      resolve(parent, args, context){
        var query = `SELECT
            post.*,
            SUM(IF(\`like\`.user_id = :user, 1, 0)) > 0 as isLiked,
            SUM(IF(\`like\`.user_id IS NOT NULL, 1, 0)) as nbLikes,
            SUM(IF(comment.id IS NOT NULL, 1, 0)) as nbComments
          FROM
            post
            LEFT JOIN \`like\` ON (post.id = \`like\`.post_id)
            LEFT JOIN post as comment  ON (post.id = comment.post_id)
          `;
          if(args.user_id){
              query += `WHERE post.user_id = :user_id
              `;
          }
          else if(args.hashtag_id){

              query += `
              LEFT JOIN post_hashtags ON (post.id = post_hashtags.post_id)
              WHERE post_hashtags.hashtag_id = :hashtag_id
              `;
          }
          else{
            query += `
            LEFT JOIN post_hashtags ON (post.id = post_hashtags.post_id)
            LEFT JOIN hashtag_followers ON (post_hashtags.hashtag_id = hashtag_followers.hashtag_id AND hashtag_followers.follower_id = :user)
            LEFT JOIN user_followers ON (post.user_id = user_followers.user_id AND user_followers.follower_id = :user)
            WHERE post.deleted_at IS NULL AND post.post_id IS NULL
              AND (
                post.user_id = :user
                OR hashtag_followers.follower_id IS NOT NULL
                OR user_followers.follower_id IS NOT NULL
            )
            `;
          }
          query += `GROUP BY post.id
          ORDER BY post.created_at DESC`;

        return Sequelize
        .query(
          query,
          {
            replacements: { user: context.user.id, user_id : args.user_id, hashtag_id : args.hashtag_id },
            type: Sequelize.QueryTypes.SELECT,
            model: Models.Post.model,
            mapToModel: true // pass true here if you have any mapped fields
          });
        }
      }
    }
  });
