/* eslint-disable camelcase */

const gql = require('graphql');

const documentReferenceFields = {
  id: {
    type: gql.GraphQLString
  },
  uid: {
    type: gql.GraphQLString
  },
  type: {
    type: gql.GraphQLString
  },
  lang: {
    type: gql.GraphQLString
  }
};

const documentBaseFields = {
  ...documentReferenceFields,
  tags: {
    type: new gql.GraphQLNonNull(new gql.GraphQLList(
      new gql.GraphQLNonNull(gql.GraphQLString)
    ))
  }
};

/**
 * Fields used in the `Document` interface, and any Prismic type that extends `Document`
 */
const documentFields = {
  ...documentBaseFields,
  href: {
    type: new gql.GraphQLNonNull(gql.GraphQLString)
  },
  first_publication_date: {
    type: new gql.GraphQLNonNull(gql.GraphQLString)
  },
  last_publication_date: {
    type: new gql.GraphQLNonNull(gql.GraphQLString)
  },
  slugs: {
    type: new gql.GraphQLNonNull(new gql.GraphQLList(
      new gql.GraphQLNonNull(gql.GraphQLString)
    ))
  },
  linked_documents: {
    type: new gql.GraphQLNonNull(new gql.GraphQLList(
      new gql.GraphQLNonNull(new gql.GraphQLObjectType({
        name: 'LinkedDocuments',
        fields: documentBaseFields
      }))
    ))
  },
  alternateLanguages: {
    type: new gql.GraphQLNonNull(new gql.GraphQLList(
      new gql.GraphQLNonNull(new gql.GraphQLObjectType({
        name: 'AlternateLanguage',
        fields: documentReferenceFields
      }))
    ))
  }
};

const linkFields = {
  link_type: {
    type: new gql.GraphQLNonNull(gql.GraphQLString)
  }
};

const documentLinkFields = {
  ...documentBaseFields,
  ...linkFields,
  slug: {
    type: gql.GraphQLString
  },
  isBroken: {
    type: gql.GraphQLBoolean
  }
};

module.exports = {
  documentLinkFields,
  documentFields,
  linkFields
};
