const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const School = require('../defs/school.def');
const SchoolModel = require('../../loaders/models.js')['School'];

module.exports = new GraphQLObjectType({
  name: `SchoolResolver`,
  fields: {
    'school': {
      type: new GraphQLList(School),
      args: {id : {type: GraphQLID}},
      resolve(parent, args, context){
        return SchoolModel.get(args.id);
      }
    },
    'schools': {
      type: new GraphQLList(School),
      args: {university_id : {type: GraphQLID}},
      resolve(parent, args, context){
        return SchoolModel.getList({ where : { university_id : args.university_id ? args.university_id : {$eq : null}}} );
      }
    }
  }
});
