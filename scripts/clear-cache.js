require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const Cache = require('./../database/cache');

Cache.clear();


process.exit(0);
