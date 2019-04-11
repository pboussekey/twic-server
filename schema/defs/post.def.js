const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLNonNull, GraphQLList } = graphql;
const graphql_date = require('graphql-iso-date');
const {
  GraphQLDateTime
} = graphql_date;
const UserDef = require('./user.def.js');
const FileDef = require('./file.def.js');
const Models = require('../../loaders/models.js');

var PostDef = new GraphQLObjectType({
  name: `PostDef`,
  fields: () => ({
    id: {type:new GraphQLNonNull(GraphQLID)},
    content: {type: GraphQLString},
    created_at: {
      type: GraphQLDateTime
    },
    user : {
      type : new GraphQLNonNull(UserDef),
      resolve(parent, args){
        return Models.User.get(parent.user_id);
      }
    },
    files : {
      type : new GraphQLList(FileDef),
      resolve(parent, args){
        return Models.File.getList({
            include: [{ model : Models.Post.model, attributes : [], where : { id : parent.id }}]
        });
      }
    },
    nbComments : {
      type : GraphQLInt,
      resolve(parent, args){
        return Models.Post.model.count({
           col : 'id',
           distinct : true,
           where : { post_id : parent.id }
        });
      }
    },
    nbLikes : {
      type : GraphQLInt,
      resolve(parent, args){
        return Models.Like.model.count({
           col : 'user_id',
           distinct : true,
           where : { post_id : parent.id }
        });
      }
    },
    isLiked : {
      type : GraphQLInt,
      resolve(parent, args, context){
        return Models.Like.model.count({
           col : 'user_id',
           distinct : true,
           where : { post_id : parent.id, user_id : context.user.id }
        });
      }
    }
  })
});

module.exports = PostDef;
