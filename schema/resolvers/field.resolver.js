const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const Field = require('../defs/field.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `FieldResolver`,
  fields: {
    'fields': {
      type: new GraphQLList(Field),
      resolve(parent, args, context){
        return Db.Field.findAll();
      }
    }
  }
});
