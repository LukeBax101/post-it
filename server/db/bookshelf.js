const fs = require('fs');
const path = require('path');

const password = fs.readFileSync(path.join(__dirname,  `../../secrets/password`), 'utf8').trim();
const knex = require('knex')({
  client: 'pg',
  connection: {
    host     : 'db',
    port     : '5432',
    user     : 'postgres',
    password,
    database : 'postgres',
    charset  : 'utf8'
  }
});
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(require('bookshelf-uuid'));

module.exports = bookshelf;
