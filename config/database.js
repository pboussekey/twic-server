require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const config = process.env;
module.exports = {
  "username": config.DB_USER,
  "password": config.DB_PWD,
  "database": config.DB_NAME,
  "host": config.DB_HOST,
  "dialect": config.DB_DIALECT || "mariadb",
  "dialectOptions": {
    timezone: '±HH:MM',
  },
  "logging": config.APP_MODE === 'dev' ? console.log : false,
  "define" : {
    freezeTableName: true,
    paranoid: true,
    underscored: true
  }
};
