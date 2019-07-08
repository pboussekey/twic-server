if(process.env.NODE_ENV){
  require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
}
process.setMaxListeners(0);
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/root.schema');
var jwt = require('express-jwt');
var JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const jsonwebtoken = require('jsonwebtoken');
const firebase = require('./firebase/firebase');
const Db = require('./database/database');
const request = require('request');
const mail = require('./services/mail');

const  { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const subscriptionsEndpoint = `ws://localhost:3000/subscriptions`;
const {createServer} = require('http');

const configuration = process.env;
const app = express();

app.use(express.json());

app.get('/authentication/', (req, res) => {
  var token = req.query.token;
  Db.MagicLink.findOne({
    where : {
      magic_token : token
    }
  }).then((magic_link) => {
    if(magic_link){
      return Db.MagicLink.update({
        token_checked : true
      }, { where : { id : magic_link.id}}).then(() => res.json({ status : "Authentified" }));
    }
    else{
      return res.status(400).json({
        type : 'error',
        error : 'Token not found'
      });
    }
  });
});

function sendMagicLink(email, request_token,  magic_token, resolve){
  var payload={
    "longDynamicLink": `https://twicapp.page.link/?link=${configuration.APP_HOST}/authentication/?token=${magic_token}&apn=io.twic.app`,
    "suffix":{
        "option":"UNGUESSABLE"
    },
  };
  return request.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${configuration.FB_APIKEY}`, {
      json: payload
    }, (error, res, body) => {
      if (error) {
        return res.status(400).json({
          type : 'error',
          error : 'user_not_found'
        });
      }
      mail.send('Twic activation', body['shortLink'], email.trim());
      resolve(request_token);
    });
}

app.post('/requestLink', (req, res) => {
  var users = Array.isArray(req.body.email) ? req.body.email : [req.body.email];
  var promises = [];
  var result = 0;
  var magic_token = uuidv4();
  var request_token = uuidv4();
  users.forEach(function(email){
    var promise = new Promise(function(resolve, reject) { Db.User.findOne({
      where : { email : email.trim() }
    }).then(function(user){
      if(user){
        Db.MagicLink.findOne({
          where : { user_id : user.id }
        }).then(function(magic_link){
          if(magic_link){
            magic_token = magic_link.magic_token;
            request_token = magic_link.request_token;
            sendMagicLink(email, magic_link.request_token, magic_link.magic_token, resolve);
          }
          else{
            Db.MagicLink.create({ magic_token : magic_token, request_token : request_token, user_id : user.id  });
            sendMagicLink(email, request_token, magic_token, resolve);

            }
          });
        }
            else{
              return res.status(400).json({
                type : 'error',
                error : 'user_not_found'
              });
            }
          });
        });

        promises.push(promise);

    });
    return Promise.all(promises).then(function(){ console.log("ALLO?"); return res.json({ request_token : request_token});} );

});

app.post('/login', (req, res) => {
  var request_token = req.body.request_token ? req.body.request_token.trim() : null;
  var magic_token = req.body.magic_token ? req.body.magic_token.trim() : null;
  console.log(request_token, magic_token);
  Db.MagicLink.findOne({
    include : [
      { model : Db.User, as : 'user',
        attributes:['id', 'firstname', 'lastname', 'email', 'type', 'isActive', 'classYear', 'degree'],
        include : [
          { model : Db.File, as : 'avatar', attributes : ['name', 'bucketname', 'token']},
          { model : Db.School, as : 'school', attributes : ['id', 'name']},
          { model : Db.School, as : 'university', attributes : ['id', 'name'],
            include : [{ model : Db.File, as : 'logo', attributes : ['name', 'bucketname', 'token']}]
          },
          { model : Db.Field, as : 'major', attributes : ['id', 'name'] },
          { model : Db.Field, as : 'minor', attributes : ['id', 'name']  }
      ]
    }
    ],
    where:{
      [Db.Sequelize.Op.or]: [ { request_token : request_token, token_checked : true }, { magic_token : magic_token} ]
    }
  }).then(magic_link => {
    user = magic_link ? JSON.parse(JSON.stringify(magic_link.user)) : null;
    if (!user) {
      return res.status(400).json({
        type : 'error',
        error : 'user_not_found',
        body : req.body
      });
    }

    Db.MagicLink.destroy({ where : { id : magic_link.id } });
      // signin user and generate a jwt
    const token = jsonwebtoken.sign({
      id: user.id
    }, configuration.AUTH_SECRET, { expiresIn: '1y' });
    return firebase.getToken().then(fbToken => res.json({
      user: user,
      token: token,
      fbtoken : fbToken
    }));

  })});

  const auth = jwt({
    secret: configuration.AUTH_SECRET
  });

  app.post('/schools', (req, res) => { console.log(req);
    return Db.School
      .findAll(
        {
          raw : true,
          where:
          {
            university_id:{[Db.Sequelize.Op.eq]:null}
          }
        }).then((schools) => res.json({ schools :  schools})); });

  app.use(auth).post('/fbtoken', (req, res) => {
    return firebase.getToken().then(fbToken => res.json({
      fbtoken : fbToken
    }));
  });



  app.use(auth).use('/api', graphqlHTTP(req => ({
    schema,
    graphiql:false,
    subscriptionsEndpoint: subscriptionsEndpoint,
    context: {
      user: req.user
    }
  })));

  app.listen(configuration.PORT, () => {
    console.log("SERVER STARTED");
  });


  const ws = createServer(app);

  ws.listen(configuration.SOCKET_PORT, () => {
      console.log(`GraphQL is now running on http://localhost:${configuration.SOCKET_PORT}`);
      const subscriptionServer = new SubscriptionServer({
            execute,
            subscribe,
            schema,
            onConnect : (data, _, context) => {
              data = JSON.parse(data);
              return JWT.verify(data['Authorization'], configuration.AUTH_SECRET, function(err, decoded){
                  if(err || !decoded) return false;
                  return { user : decoded };
              });
            },
        }, {
            server: ws,
            reconnect: true,
            path: '/subscriptions',
        });

  });
