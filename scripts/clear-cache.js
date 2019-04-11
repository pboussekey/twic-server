require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const User = require('./../database/models/user.model');
const Post = require('./../database/models/post.model');
const School = require('./../database/models/school.model');

const Models = require('../_models');
const _ = require('lodash');

_.forIn(Models, M => { console.log("CLEAR CACHE",M.model.name); M.clearAll();});


process.exit(0);
