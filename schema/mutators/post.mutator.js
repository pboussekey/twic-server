const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLInt } = graphql;
const Db = require('../../database/database');
const PostDef = require('../defs/post.def');
const ResultDef = require('../defs/result.def');
const FileInputDef = require('../defs/file_input.def');
const _ = require('lodash');

module.exports = new GraphQLObjectType({
  name: `PostMutator`,
  fields: {
    addPost: {
      type : PostDef,
      args : {
        content : { type :  GraphQLString },
        parent_id : { type :  GraphQLID },
        privacy : { type :  GraphQLString, default : "PUBLIC" },
        files : { type :  new GraphQLList(FileInputDef) },
        mentions : { type :  new GraphQLList(GraphQLID) },
      },
      resolve : (parent, args, context) =>
      Db.Post.create({content : args.content, privacy : args.privacy, user_id : context.user.id, parent_id : args.parent_id})
      .then(function(post){
        if(post.content){
          var hashtagRegex = /#[^\s\\]+/g;
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

            var mentionRegex = /@[^\s\\]+/g;
            var mentions = post.content.match(mentionRegex);
            (mentions || []).forEach(function(mention){
              mention = mention.substr(1);
              Db.User.findOne({
                attribute : ['id'],
                where : [Db.sequelize.where(
                  Db.sequelize.fn('lower', Db.sequelize.fn('concat',Db.sequelize.col('firstname'),
                  Db.sequelize.col('lastname'))),mention.toLowerCase()),
                  { id : args.mentions }] })
                .then(function(u){
                  if(u && u.id){
                    Db.PostMention.create({ user_id : u.id, post_id : post.id });
                    args.mentions.splice(args.mentions.indexOf(u.id), 1);
                  }
                });
              });
          }
          if(args.parent_id){
              Db.Post.update({ nbComments: Db.sequelize.literal('nb_Comments + 1') }, { where: { id: args.parent_id } });
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
                  user_id : context.user.id,
                  preview : f.preview ? {
                      name : f.preview.name,
                      bucketname : f.preview.bucketname,
                      token : f.preview.token,
                      type : f.preview.type,
                      user_id : context.user.id,
                  } : null
                }, {
                  include : [{association : Db.File.preview}]
                })
                .then(file => Db.PostFile.create({ post_id : post.id, file_id : file.id})) : Db.PostFile.create({ post_id : post.id, file_id : f.id}));
              }
              return post;
            })
          },
          likePost : {
            type : ResultDef,
            args : {
              post_id : { type :  GraphQLID },
            },
            resolve : (parent, args, context) => Db.Like
              .create({ post_id : args.post_id, user_id : context.user.id})
              .then(function(){
                Db.Post.update({ nbLikes: Db.sequelize.literal('nb_likes + 1') }, { where: { id: args.post_id } });
                return { success : true };})
            .catch((error) => ({ success : false, message : 'Already liked'}))
          },
          unlikePost : {
            type : ResultDef,
            args : {
              post_id : { type :  GraphQLID },
            },
            resolve : (parent, args, context) => Db.Like
              .destroy({ post_id : args.post_id, user_id : context.user.id})
              .then(function(){
                Db.Post.update({ nbLikes: Db.sequelize.literal('nb_likes + 1') }, { where: { id: args.post_id } });
                return { success : true };})
            .catch(() => ({ success : false, message : 'Not liked'}))
          }
        }
      });
