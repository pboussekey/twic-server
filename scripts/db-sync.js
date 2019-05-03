require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const Db = require('./../database/database');

Db.sequelize.sync({ force : true}).then(() => process.exit(0));
