# Twic-server

Twic server is an API using REST for authentication and GraphQL for querying based on NodeJs.

## Installation

1) `npm install` to install every dependencies
2) Create your **env/default.env** configuration file based on the **envs/default.env.dist** file

|Key|Value|
|---|---| 
|**PORT**| Binds and listens for connections on the specified port for resolvers and mutators.| 
|**SOCKET_PORT**| Binds and listens for connections on the specified port for subscriptions.| 
|**APP_HOST**| The host of your API, used for deeplink redirection for authentication | 
|**APP_MODE**| **dev** or **prod**, activate or not SQL logs in terminal.| 
|**DB_HOST**| Database host | 
|**DB_USER**| Database username | 
|**DB_PWD**| Database password | 
|**DB_NAME**| Database name | 
|**AUTH_SECRET**| Salt used to encrypt authentication token | 
|**FB_DB**| Firebase database url | 
|**FB_APIKEY**| Firebase API Key | 
|**FB_UID**| Key used by firebase to create custom token | 
|**MG_APIKEY**| Mailgun api key | 
|**MG_DOMAIN**| Mailgun host| 
|**MG_FROM**| Emails sender | 

3) Generate a private key file for your service account (Firebase console, open Settings > Service Accounts > Generate New Private Key, then confirm by clicking Generate Key) and copy it under **firebase/gc.json** and **functions/config/gc.json**.
4) Run `db-sync` command to generate your database structure (**This command will erase your database if it already exists**)
5) Run `npm run watch` or `npm run start`to launch the server. The first option will automatically restarting the node application when file changes in the directory are detected.


## Authentication

Magic link authentication : 
- User request a link by providing their email (JSON REST request) : **/requestLink** - *{ "email" :	"paul@twic.io" }*
- If the user exists in database, the API generating a **request** and a **magic** tokens :
    - The **request token**  is sent back in the response. 
    - The **magic token** is sent on the email provided through a magic link.
- The user click on the link sent
    - On mobile, the magic token is provided to the app that log the user (JSON REST request) : **/login** - *{ "request_token" :	"token", "magic_token" : "token2" }*
    - On desktop, the link redirect to the url **APP_HOST/authentication/** providing the magic token. The server validate the request linked to this token and the app is able to login only with the request token : **/login** - *{ "request_token" :	"token" }*

The API provide a JWT token to users once they login to authentified them. This token has to be provide in the header for every GraphQL request (*{"Authorization":"Bearer JWTTOKEN"}*)

## GraphQL Schema

The GraphQL server is based on [express-graphql](https://github.com/graphql/express-graphql) package.

Every part of the schema has to be store in a separate file :
- **schemas/defs** contains object types and definition : **schema/defs/yourtype.def.js** 
- **schemas/resolvers** contains resolvers to request and retrieve instances of your types : **schema/resolvers/yourtype.resolver.js** 
- **schemas/mutators** contains mutators to create or update instance of your types : **schema/mutators/yourtype.mutator.js** 
- **schemas/subscriptions** contains subscriptions to listen to notification about your types : **schema/subscriptions/yourtype.subsctription.js** 

Every file is merge into a global schema in **schema/root.schema.js**. You can use a graphQL client to discover it but headers support is needed to handle authentication ([Altair](https://altair.sirmuel.design/)).

## Database

The API use [Sequelize](http://docs.sequelizejs.com/) ORM to manage the database. Sequelize configuration is stored in **config/database.js**.

You need to define a model for each table in your database (not mandatory for *n* to *n* association table but it's recomend to do it).
Every models has to be store in a separate file under **models/** => **models/yourtype.model.js**.

### Querying database

Use the database service to retrieve your sequelize models.

```javascript
//From a resolver
const Db = require('../../database/database');

Db.YourModel.findOne({
  where : { id : id}
}).then((yourmodel) =>{
  ///Your code
});
```
Sequelize allow you to build really complex requests without writting SQL but you are smarter than that. 
To optimize performance, you really should write these requests yourself.

```javascript
//From a resolver
const Db = require('../../database/database');

Db.sequelize
      .query(
        `SELECT
        yourtable.*
        FROM
        yourtable
        ...
        WHERE yourfield = :field`,
        {
          replacements: { field: field },
          type: Db.Sequelize.QueryTypes.SELECT,
          model: Db.YourModel,
          mapToModel: true
        }).then((yourmodels) => {
          //Your code
        });
```

### Using cache to store models

Use the cache service to store and retrieve models by id.
This service is based on [graphql-dataloader](https://github.com/graphql/dataloader).

```javascript
//From a resolver
const Db = require('../../database/database');
const Cache = require('../../database/cache');

Cache.get(Db.YourModel, id)
  .then((yourModel) => {
    //Your code
});
```
The service return an instance of `YourModel` with the provided id.
By default, the service only get the instance of a model by id.

```javascript
_cache[model.name] = new DataLoader(async function(ids) {
    var result = await model.findAll({ raw: true, where : {id : ids} });
    var objects = _.groupBy(result, 'id');
    return ids.map(id => objects[id] ? objects[id][0] : null);
  });
```
But you can extend that behavior for your model by defining a `get` method into it.
That method take an array of ids as parameters and has to return a map of the same length indexes with those ids.

```javascript
// In your model definition file

YourModel.get = async function(ids){
   var models = await YourModel.findAll({ raw : true, where : { id : ids, field : 'specific_value'}});
   var objects = _.groupBy(models, 'id');
   return ids.map(id => objects[id] ? objects[id] : []);
};
```

### Database migration

For database updates, use the [Sequelize migration](http://docs.sequelizejs.com/manual/migrations.html) system.


## Services

### Mail

A service based on [mailgun-js](https://github.com/bojand/mailgun-js) to send emails.
```javascript

const mail = require('./services/mail');
mail.send('Title', 'body', 'email');
```


### FCM

A service based on [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) to send notifications.
```javascript

const Fcm = require('./services/fcm');
var ntf = {
    registration_ids: fcm_tokens,
    notification: {
          title: "title",
          body: "text"
    },
    data: {
        "type" : "Notification",
        "data" : data,
        "click_action": "FLUTTER_NOTIFICATION_CLICK",
    }
};
Fcm.send(ntf, function(err, response){
    if (err) {
        console.log("Something has gone wrong!",err, response);
    } else {
        console.log("Successfully sent with response: ", response.results[0]);
    }
});
```

## Commands

Some npm commands :


|Command|Usage|
|---|---| 
|**watch**| Starts server and automatically restarting it when file changes in the directory are detected.| 
|**db-sync**| Synchronize database with all sequelize models (**Destroy exististing database**).| 
|**create**| Create a model or a schema file from name based on templates stored in **scripts/tpl**  : `npm run create -- yourmodel -mdrus` :<br>- `m` : Create the model file **models/yourmodel.model.js** from **scripts/tpl/model.tpl** <br>- `d` : Create the definition file **schema/defs/yourmodel.def.js** from **scripts/tpl/def.tpl** <br>- `r` : Create the resolver file **schema/resolvers/yourmodel.resolver.js** from **scripts/tpl/resolver.tpl**  <br>- `u` : Create the mutator file **schema/mutators/yourmodel.mutator.js** from **scripts/tpl/mutator.tpl** <br>- `s` : Create the subscription file **schema/subscriptions/yourmodel.subscription.js** from **scripts/tpl/subscription.tpl**|  
