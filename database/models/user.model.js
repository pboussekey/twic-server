const Sequelize = require('sequelize');
const Model = require('./abstract_model');
const School = require('./school.model');
const Field = require('./field.model');
const File = require('./file.model');
const Hashtag = require('./hashtag.model');

const User = new Model('User', {
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
  password: {
    type: Sequelize.STRING
  },
  classYear: {
    type: Sequelize.INTEGER
  },
  type: {
    type: Sequelize.STRING,
    defaultValue: function() {
      return "PERSONAL";
    }
  },
  isActive: {
    type: Sequelize.BOOLEAN
  },
  followed: {
    type: Sequelize.VIRTUAL
  },
  nbfollowers: {
    type: Sequelize.VIRTUAL
  },
  nbfollowings: {
    type: Sequelize.VIRTUAL
  },
  nbPosts: {
    type: Sequelize.VIRTUAL
  }
});

User.model.belongsTo(School.model);
User.model.belongsTo(Field.model, { foreignKey: 'major_id', as : 'major' });
User.model.belongsTo(Field.model, { foreignKey: 'minor_id', as : 'minor' });
User.model.belongsTo(File.model, { foreignKey : 'avatar_id', as : 'avatar'});

User.model.belongsToMany(User.model, {through: 'user_followers', as : 'followers'});
User.model.belongsToMany(User.model, {through: 'user_followers', as : 'followings', foreignKey : 'follower_id'});


module.exports = User;
