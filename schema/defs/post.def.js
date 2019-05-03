const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull, GraphQLList } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;
const UserDef = require('./user.def.js');
const FileDef = require('./file.def.js');
const Db = require('../../database/database');
const Cache = require('../../database/cache');

var PostDef = new GraphQLObjectType({
  name: `PostDef`,
  fields: () => ({
    id: {type:new GraphQLNonNull(GraphQLID)},
    content: {type: GraphQLString},
    createdAt: {
      type: GraphQLDateTime
    },
    user : {
      type : UserDef,
      resolve(parent, args){
        return Cache.get(Db.User, parent.user_id);
      }
    },
    files : {
      type : new GraphQLList(FileDef),
      resolve(parent, args){
        return Db.File.findAll({
            raw : true,
            include: [{ model : Db.Post, attributes : [], where : { id : parent.id }}]
        });
      }
    },
    nbComments : {
      type : GraphQLInt,
      resolve(parent, args){
        return Db.Post.count({
           col : 'id',
           distinct : true,
           where : { post_id : parent.id }
        });
      }
    },
    nbLikes : {
      type : GraphQLInt,
      resolve(parent, args){
        return Db.Like.count({
           col : 'user_id',
           distinct : true,
           where : { post_id : parent.id }
        });
      }
    },
    isLiked : {
      type : GraphQLInt,
      resolve(parent, args, context){
        return Db.Like.count({
           col : 'user_id',
           distinct : true,
           where : { post_id : parent.id, user_id : context.user.id }
        });
      }
    }
  })
});

module.exports = PostDef;
