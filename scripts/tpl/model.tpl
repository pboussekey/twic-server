const Db = require('./database');

const {Name} = Db.sequelize.define('{Name}', {});

module.exports = {Name};
