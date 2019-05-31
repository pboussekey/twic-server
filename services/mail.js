if(process.env.NODE_ENV){
  require('dotenv').config({ path: './envs/' + process.env.NODE_ENV + '.env' });
}

const configuration = process.env;

var api_key = configuration.MG_APIKEY;
var domain = configuration.MG_DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

module.exports.send = function(subject, content, to, from){
  console.log(arguments);
  var data = {
    from: from || configuration.MG_FROM,
    to: to,
    subject: subject,
    text: content
  };
  return mailgun.messages().send(data);
}
