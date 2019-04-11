var admin = require('firebase-admin');
const configuration = process.env;

var serviceAccount = require('./gc.json');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: configuration.FB_DB
});


module.exports =  {
  getToken : function(){
    return admin.auth().createCustomToken(configuration.FB_UID)
    .then(function(customToken) {
      return customToken;
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
    });

  } };
