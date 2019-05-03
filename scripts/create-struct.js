const fs = require('fs');
const _ = require('lodash');

var _options = {
  m : './model',
  d : 'schema/def',
  r : 'schema/resolver',
  u : 'schema/mutator'
};

var argv = require('minimist')(process.argv.slice(2));
if(!argv._.length){
  console.log('You must provide a name param.');
  process.exit(-1);
}

function createFromTpl(name, source, destination){

  console.log(`Read ${source}`);
  fs.exists(destination, function (exists) {
    if (exists) {
        console.log(`${destination} already exists`);
        process.exit(-1);
    }
  });

  fs.readFile(source, "utf8", function(err, content) {
    content = content.replace(/{name}/g, name).replace(/{Name}/g, _.upperFirst(name));
    if(err){
      console.log(err);
      process.exit(-1);
    }
    console.log(`Write ${destination}`);
    fs.writeFile(destination, content, function(err) {
      if(err) {
        console.log(err);
        process.exit(-1);
      }
      console.log(`${destination} created`);

    });

  });

}

var name = argv._[0]
var types = [];
_.forOwn(_options, (value, key) => argv[key] && types.push(value) );
types.forEach(arg => {
    arg = arg.split('/');
    console.log(name, arg);
    createFromTpl(name, `scripts/tpl/${arg[1]}.tpl`, `${arg[0]}/${arg[1]}s/${name}.${arg[1]}.js`);
});
