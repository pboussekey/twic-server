const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean,  GraphQLNonNull, GraphQLList, GraphQLID } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;
const UserDef = require('./user.def.js');
const FileDef = require('./file.def.js');
const HashtagDef = require('./hashtag.def.js');
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
    hashtags : {
      type : new GraphQLList(HashtagDef),
      resolve(parent, args){
        return Db.Hashtag.findAll({
            raw : true,
            include: [{ model : Db.Post, attributes : [], where : { id : parent.id }}]
        });
      }
    },
    mentions : {
      type : new GraphQLList(UserDef),
      resolve(parent, args){
        return Db.User.findAll({
            raw : true,
            include: [{ model : Db.Post, as : 'mentions', attributes : [], where : { id : parent.id }}]
        });
      }
    },
    nbComments : {
      type : GraphQLInt
    },
    nbLikes : {
      type : GraphQLInt
    },
    isLiked : {
      type : GraphQLBoolean
    }
  })
});

module.exports = PostDef;
