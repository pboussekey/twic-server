const glob = require("glob");
const path = require( 'path' );
const _ = require('lodash');

function loader(folder, type){
    glob.sync(`./${folder}/${type}s/*.${type}.js`).forEach( function( file ) {
      var value = require( path.resolve( file ) );
      var name = _.upperFirst(_.camelCase(file.replace(/^.*[\\\/]/, '').replace(`.${type}.js`,'')));
      this[name] = value;
    }.bind(this));
}


module.exports = loader;
