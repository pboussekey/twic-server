const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLInt } = graphql;
const Post = require('../defs/post.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `PostResolver`,
  fields: {
    posts: {
      type: new GraphQLList(Post),
      args: {
        user_id : {type: GraphQLID},
        hashtag_id : {type: GraphQLID},
        parent_id : {type: GraphQLID},
        count : { type : GraphQLInt},
        page : { type : GraphQLInt},
      },
      resolve(parent, args, context){
        var query = `SELECT
            post.*,
            \`like\`.post_id IS NOT NULL as isLiked
          FROM
            post
            LEFT JOIN \`like\` ON (post.id = \`like\`.post_id AND \`like\`.user_id = :user)
            `;
          if(args.user_id){
              query += `WHERE post.user_id = :user_id
              `;
          }
          else if(args.hashtag_id){

              query += `
              LEFT JOIN post_hashtag ON (post.id = post_hashtag.post_id AND post_hashtag.hashtag_id = :hashtag)
              `;
          }
          else if(args.parent_id){
              query += `
              WHERE post.parent_id = :parent
              `;
          }
          else{
            query += `
             JOIN (SELECT DISTINCT p.id
                       FROM post p
                       LEFT JOIN post_hashtag ON (p.id = post_hashtag.post_id)
                       LEFT JOIN hashtag_follower ON (post_hashtag.hashtag_id = hashtag_follower.hashtag_id AND hashtag_follower.follower_id = :user)
                       LEFT JOIN user_follower ON (p.user_id = user_follower.user_id AND user_follower.follower_id = :user)
                       WHERE p.deleted_at IS NULL AND p.parent_id IS NULL
                         AND (
                           p.user_id = :user
                           OR hashtag_follower.follower_id IS NOT NULL
                           OR user_follower.follower_id IS NOT NULL
                       )) AS posts ON post.id = posts.id

            `;
          }
          query += `
          ORDER BY post.created_at ${args.parent_id ? 'ASC' : 'DESC'}
          LIMIT ${(args.count || 10) * (args.page || 0)},${args.count || 10}`;

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
