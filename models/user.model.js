const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const School = require('./school.model');
const Field = require('./field.model');
const File = require('./file.model');
const Hashtag = require('./hashtag.model');

const User = sequelize.define('user', {
  firstname: {
    type: Sequelize.STRING
  },
  lastname: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
  },
  classYear: {
    type: Sequelize.INTEGER,
    underscored:true
  },
  degree: {
    type: Sequelize.ENUM('UNDERGRADUATE', 'GRADUATE'),
  },
  type: {
    type: Sequelize.ENUM('PERSONAL', 'SCHOOL'),
    defaultValue: 'PERSONAL'
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    underscored:true,
    defaultValue: false
  },
  followed: {
    type: Sequelize.VIRTUAL
  },
  nbFollowers: {
    type: Sequelize.VIRTUAL
  },
  nbFollowings: {
    type: Sequelize.VIRTUAL
  },
  nbPosts: {
    type: Sequelize.VIRTUAL
  }
});

User.belongsTo(School, { foreignKey: 'school_id', as : 'school' });
User.belongsTo(Field, { foreignKey: 'major_id', as : 'major' });
User.belongsTo(Field, { foreignKey: 'minor_id', as : 'minor' });
User.belongsTo(File, { foreignKey : 'avatar_id', as : 'avatar'});

User.belongsToMany(User, {through: 'user_follower', as : 'followers'});
User.belongsToMany(User, {through: 'user_follower', as : 'followings', foreignKey : 'follower_id'});


module.exports = User;
