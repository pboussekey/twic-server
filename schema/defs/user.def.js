const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLInt, GraphQLBoolean } = graphql;
const SchoolDef = require('./school.def.js');
const FieldDef = require('./field.def.js');
const FileDef = require('./file.def.js');
const Models = require('../../loaders/models.js');

module.exports = new GraphQLObjectType({
  name: `UserDef`,
  fields:  {
    id: {type:new GraphQLNonNull(GraphQLID)},
    firstname: {type: GraphQLString},
    lastname: {type: GraphQLString},
    email: {type: new GraphQLNonNull(GraphQLString)},
    type: {type: new GraphQLNonNull(GraphQLString)},
    classYear: {type: GraphQLInt},
    isActive: {type: GraphQLBoolean},
    nbFollowers: {type: GraphQLInt},
    nbFollowings: {type: GraphQLInt},
    nbPosts: {type: GraphQLInt},
    followed: {type: GraphQLBoolean},
    avatar:  {
      type : FileDef,
      resolve(parent, args){
        return Models.File.get(parent.avatar_id);
      }
    },
    school : {
      type : new GraphQLNonNull(SchoolDef),
      resolve(parent, args){
        return Models.School.get(parent.school_id);
      }
    },
    major : {
      type : FieldDef,
      resolve(parent, args){
        return Models.Field.get(parent.major_id);
      }
    },
    minor : {
      type : FieldDef,
      resolve(parent, args){
        return Models.Field.get(parent.minor_id);
      }
    }
  }});
