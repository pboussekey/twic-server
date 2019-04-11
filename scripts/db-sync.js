require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const Models = require('../loaders/models');
const _ = require('lodash');
const sequelize = require('../database/sequelize');



var done = _.after(_.keys(Models).length , () => sequelize.sync({ alter : true}).then(() => process.exit(0)));

_.forIn(Models, M => M.model.sync({ alter : true }).then(done));
