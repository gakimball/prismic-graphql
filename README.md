# Don't Use This.

Before [Prismic released its own GraphQL API](https://prismic.io/docs/graphql/getting-started/intro-to-the-graphql-api), I started building this thing to learn GraphQL. It's unfinished, and not needed now that there's an official API.

# prismic-graphql

> GraphQL schema generator for Prismic

## Usage

```js
const express = require('express');
const expressGraphQL = require('express-graphql');
const prismicGraphQL = require('prismic-graphql');

const app = express();

prismicGraphQL('path/to/schemas').then(schema => {
  app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
  }));

  app.listen(4000);
});
```

## API

### prismicGraphQL(folder)

Create a GraphQL schema from a folder containing Prismic JSON schemas.

- **param** (String): Path to folder.

Returns a Promise containing a GraphQL schema.

## Local Development

```bash
git clone https://github.com/gakimball/prismic-graphql
cd prismic-graphql
npm install
npm test
```

## License

MIT &copy; [Geoff Kimball](http://geoffkimball.com)
