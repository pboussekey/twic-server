const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const School = require('../defs/school.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `SchoolResolver`,
  fields: {
    'school': {
      type: new GraphQLList(School),
      args: {id : {type: GraphQLID}},
      resolve(parent, args, context){
        return Db.School.get(args.id);
      }
    },
    'schools': {
      type: new GraphQLList(School),
      args: {university_id : {type: GraphQLID}},
      resolve(parent, args, context){
        return Db.School.findAll({ raw : true, where : { university_id : args.university_id ? args.university_id : {[Db.Sequelize.Op.eq] : null}}} );
      }
    }
  }
});
