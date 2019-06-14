const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString } = graphql;
const School = require('../defs/school.def');
const Db = require('../../database/database');
const Cache = require('../../database/cache');

module.exports = new GraphQLObjectType({
  name: `SchoolResolver`,
  fields: {
    'school': {
      type: School,
      args: {id : {type: GraphQLID}},
      resolve(parent, args, context){
        console.log("??");
        return Cache.get(Db.School,args.id);
      }
    },
    'schools': {
      type: new GraphQLList(School),
      args: {
        university_id : {type: GraphQLID},
        search : { type : GraphQLString },
        degree : { type : GraphQLString }
      },
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT school.*
          FROM school
          WHERE
          ${ !args.university_id ? '1' : 'school.university_id = :university' }
          ${ args.degree ? ' AND school.degree = :degree' : '' }
          ${ args.search ? ' AND school.name LIKE :search' : ''}`,
          {
            replacements: {
              university: args.university_id,
              degree: args.degree,
              search : args.search ? args.search.toLowerCase() + '%' : null,
            },
            type: Db.Sequelize.QueryTypes.SELECT,
            model : Db.School,
            mapToModel : true
          });
      }
    }
  }
});
