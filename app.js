.corequire('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/root.schema');
var jwt = require('express-jwt');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const Models = require('./loaders/models');
const firebase = require('./firebase/firebase');
const Op = require('./database/sequelize').Op;

const configuration = process.env;
const app = express();

app.use(express.json());

app.post('/login', (req, res) => {
  Models.User.model.findOne({
    attributes:['id', 'firstname', 'lastname', 'email', 'type', 'password','isActive', 'classYear'],
    include : [
      { model : Models.File.model, as : 'avatar', attributes : ['name', 'bucketname', 'token']},
      { model : Models.School.model, attributes : ['id', 'name'],
        include : [
          { model : Models.School.model, as : 'university', attributes : ['id','name'],
              include : [{ model : Models.File.model, as : 'logo', attributes : ['name', 'bucketname', 'token']}] },
          { model : Models.File.model, as : 'logo', attributes : ['name', 'bucketname', 'token']}
        ]
      },
      { model : Models.Field.model, as : 'major', attributes : ['id', 'name'] },
      { model : Models.Field.model, as : 'minor', attributes : ['id', 'name']  }
    ],
    where:{
      email: req.body.email
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
    bcrypt.compare(req.body.password, user.password).then(function(valid){
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


  app.post('/schools', (req, res) =>
    Models.School
      .getList(
        {
          where:
          {
            university_id:{[Op.eq]:null}
          }
        }).then((schools) => res.json({ schools :  schools})));

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
