const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;
const Models = require('../../loaders/models.js');
const FileDef = require('./file.def.js');

var Def = new GraphQLObjectType({
  name: `SchoolDef`,
  fields:  () => ({
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    logo:  {
      type : FileDef,
      resolve(parent, args){
        return Models.File.get(parent.logo_id);
      }
    },
    university : {
      type : Def,
      resolve(parent, args){
        return Models.School.get(parent.university_id);
      }
    }
  })
});

module.exports = Def;
