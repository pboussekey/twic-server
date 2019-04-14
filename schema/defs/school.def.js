const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull } = graphql;
const Db = require('../../database/database');
const Cache = require('../../database/cache');
const FileDef = require('./file.def.js');

var Def = new GraphQLObjectType({
  name: `SchoolDef`,
  fields:  () => ({
    id: {type:new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    logo:  {
      type : FileDef,
      resolve(parent, args){
        return Cache.get(Db.File, parent.logo_id);
      }
    },
    university : {
      type : Def,
      resolve(parent, args){
        return Cache.get(Db.School, parent.university_id);
      }
    }
  })
});

module.exports = Def;
