if(process.env.NODE_ENV){
  require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
}

const configuration = process.env;


var FCM = require('fcm-node');
module.exports = new FCM(require('../firebase/gc.json'));
