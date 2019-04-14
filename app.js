require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/root.schema');
var jwt = require('express-jwt');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const firebase = require('./firebase/firebase');
const Db = require('./database/database');

const configuration = process.env;
const app = express();

app.use(express.json());
console.log(Db.User);
app.post('/login', (req, res) => {
  Db.User.findOne({
    attributes:['id', 'firstname', 'lastname', 'email', 'type', 'password','isActive', 'classYear'],
    include : [
      { model : Db.File, as : 'avatar', attributes : ['name', 'bucketname', 'token']},
      { model : Db.School, attributes : ['id', 'name'],
        include : [
          { model : Db.School, as : 'university', attributes : ['id','name'],
              include : [{ model : Db.File, as : 'logo', attributes : ['name', 'bucketname', 'token']}] },
          { model : Db.File, as : 'logo', attributes : ['name', 'bucketname', 'token']}
        ]
      },
      { model : Db.Field, as : 'major', attributes : ['id', 'name'] },
      { model : Db.Field, as : 'minor', attributes : ['id', 'name']  }
    ],
    where:{
      email: req.body.email.trim()
    }
  }).then(user => {
    user = JSON.parse(JSON.stringify(user));
    if (!user) {
      return res.status(400).json({
        type : 'error',
        error : 'user_not_found',
        body : req.body
      });
    }
    bcrypt.compare(req.body.password.trim(), user.password).then(function(valid){
      if (!valid) {

        return res.status(400).json({
          type : 'error',
          error : 'invalid_pwd'
        });
      }
      user.password = null;
      // signin user and generate a jwt
      const token = jsonwebtoken.sign({
        id: user.id
      }, configuration.AUTH_SECRET, { expiresIn: '1y' });
      return firebase.getToken().then(fbToken => res.json({
        user: user,
        token: token,
        fbtoken : fbToken
      }));

    });
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



  app.use(auth).use('/api', graphqlHTTP(req => { console.log(req.body); return ({
    schema,
    graphiql:true,
    context: {
      user: req.user
    }
  })}));

  app.listen(configuration.PORT, () => {
    console.log("SERVER STARTED");
  });
