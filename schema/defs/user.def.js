const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLBoolean } = graphql;
const SchoolDef = require('./school.def.js');
const FieldDef = require('./field.def.js');
const FileDef = require('./file.def.js');
const Db = require('../../database/database');
const Cache = require('../../database/cache');

module.exports = new GraphQLObjectType({
  name: `UserDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    firstname: {type: GraphQLString},
    lastname: {type: GraphQLString},
    email: {type: new GraphQLNonNull(GraphQLString)},
    type: {type: new GraphQLNonNull(GraphQLString)},
    degree: {type: GraphQLString},
    description: {type: GraphQLString},
    classYear: {type: GraphQLInt},
    isActive: {type: GraphQLBoolean},
    nbFollowers: {type: GraphQLInt},
    nbFollowings: {type: GraphQLInt},
    nbPosts: {type: GraphQLInt},
    followed: {type: GraphQLBoolean},
    avatar:  {
      type : FileDef,
      resolve(parent, args){
        return Cache.get(Db.File, parent.avatar_id);
      }
    },
    school : {
      type : SchoolDef,
      resolve(parent, args){
        return Cache.get(Db.School, parent.school_id);
      }
    },
    major : {
      type : FieldDef,
      resolve(parent, args){
        return Cache.get(Db.Field, parent.major_id);
      }
    },
    minor : {
      type : FieldDef,
      resolve(parent, args){
        return Cache.get(Db.Field, parent.minor_id);
      }
    }
  }});
