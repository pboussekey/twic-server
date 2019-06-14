const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString } = graphql;
const Field = require('../defs/field.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `FieldResolver`,
  fields: {
    fields: {
      type: new GraphQLList(Field),
      args: {school_id : {type: GraphQLID}, search : {type: GraphQLString}},
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT
          field.*
          FROM
          field
          JOIN school_field ON (field.id = school_field.field_id)
          WHERE field.deleted_at IS NULL
          ${args.search ? 'AND LCASE(field.name) LIKE :search' : ''}
          ${args.school_id ? 'AND school_field.school_id = :school' : ''}
          GROUP BY field.id
          ORDER BY field.name ASC`,
          {
            replacements: { school: args.school_id, search : args.search ? args.search.toLowerCase() + '%' : null },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Field,
            mapToModel: true
          });
      }
    }
  }
});
