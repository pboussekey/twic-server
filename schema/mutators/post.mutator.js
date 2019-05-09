const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const PostDef = require('../defs/post.def');
const FileInputDef = require('../defs/file_input.def');
const _ = require('lodash');

module.exports = new GraphQLObjectType({
  name: `PostMutator`,
  fields: {
    addPost: {
      type : PostDef,
      args : {
        content : { type :  GraphQLString },
        privacy : { type :  GraphQLString, default : "PUBLIC" },
        files : { type :  new GraphQLList(FileInputDef) },
      },
      resolve : (parent, args, context) =>
      Db.Post.create({content : args.content, privacy : args.privacy, user_id : context.user.id})
      .then(function(post){
        if(post.content){
          var hashtagRegex = /#[A-Za-z0-9]+/g;
          var hashtags = post.content.match(hashtagRegex);
          (hashtags || []).forEach(function(hashtag){
            hashtag = hashtag.substr(1);
            Db.Hashtag.findOne({
              attribute : ['id'],
              where : Db.sequelize.where(Db.sequelize.fn('lower', Db.sequelize.col('name')),hashtag.toLowerCase()) })
              .then(function(h){
                if(h && h.id){
                  Db.PostHashtag.create({ hashtag_id : h.id, post_id : post.id });
                }
                else{
                  Db.Hashtag.create({ name : hashtag }).then(h => Db.PostHashtag.create({ hashtag_id : h.id, post_id : post.id }))
                }
              });
            });
          }

          if(args.files){
            args.files.forEach(f =>
              !f.id ?
              Db.File.create(
                {
                  name : f.name,
                  bucketname : f.bucketname,
                  token : f.token,
                  type : f.type,
                  user_id : context.user.id
                })
                .then(file => Db.PostFile.create({ post_id : post.id, file_id : file.id})) : Db.PostFile.create({ post_id : post.id, file_id : f.id}));
              }
              return post;
            })
          }
        }
      });
