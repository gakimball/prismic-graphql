/* eslint-disable camelcase */

const path = require('path');
const express = require('express');
const expressGraphql = require('express-graphql');
const dotenv = require('dotenv');
const gql = require('graphql');
const createSchema = require('./lib/create-schema');

dotenv.config();

const app = express();

process.on('unhandledRejection', err => console.log(err));

function pbcopy(data) {
  const proc = require('child_process').spawn('pbcopy');

  proc.stdin.write(data);
  proc.stdin.end();

  console.log('Did it!');
}

createSchema(path.join(__dirname, 'schemas')).then(schema => {
  pbcopy(gql.printSchema(schema));

  app.use('/graphql', expressGraphql({
    schema,
    graphiql: process.env.NODE_ENV !== 'production'
  }));

  app.listen(3001, () => {
    console.log('> Listening on port 3001');
  });
});
