const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID } = graphql;
const Notification = require('../defs/notification.def');
const Db = require('../../database/database');

module.exports = new GraphQLObjectType({
  name: `NotificationResolver`,
  fields: {

    'notifications': {
      type: new GraphQLList(Notification),
      resolve(parent, args, context){
        return Db.sequelize
        .query(
          `SELECT
          notification.*,
          COUNT(DISTINCT grp.id) as count
          FROM
          notification
          JOIN user ON notification.creator_id = user.id
          JOIN notification as grp ON (notification.key = grp.key
            AND grp.last IS FALSE
            AND grp.deleted_at IS NULL)
          WHERE notification.last IS true AND notification.user_id = :user AND notification.deleted_at IS NULL
          GROUP BY notification.id ORDER BY id DESC`,
          {
            replacements: {
              user: context.user.id
            },
            type: Db.Sequelize.QueryTypes.SELECT,
            model: Db.Notification,
            mapToModel: true
          });
        }
      }
  }
});

function _getCurrentWeekNb(){
  var today = new Date();
  var firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  var pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

Db.Notification.beforeCreate(async function(notification){
    var today = new Date();
    notification.key = notification.type + _getCurrentWeekNb() + today.getFullYear();
    Db.Notification.update({last : false},{ where : 
      { key : notification.key,
        deletedAt:null}
    });
});

Db.Notification.afterDestroy(async function(notification){
  console.log("\nDeleted", notification);
  if(notification.last){
   var last = await Db.Notification.findOne({
        where: {
            deletedAt : null,
            user_id : notification.user_id,
            key : notification.key
        }
    });
    if(last){
      Db.Notification.update({ last : true}, { where : {id : last.id}});
    }
 }


});
