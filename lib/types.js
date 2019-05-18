/* eslint-disable camelcase */

const gql = require('graphql');
const Prismic = require('prismic-javascript');
const {documentLinkFields, linkFields, documentFields} = require('./fields');
const {identity, parseObject} = require('./utils');

/**
 * Get the Prismic API handler.
 * @param {Object} req - Express request object.
 * @returns {Object} Prismic API handler.
 * @private
 */
const getApi = async req => Prismic.getApi(`https://${process.env.PRISMIC_REPO_NAME}.prismic.io/api/v2`, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  req
});

/**
 * Prismic image field.
 */
const LinkType = new gql.GraphQLScalarType({
  name: 'Link',
  description: 'A Prismic link object.',
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseObject
});

const DocumentLinkType = new gql.GraphQLObjectType({
  name: 'DocumentLink',
  fields: documentLinkFields
});

const WebLinkType = new gql.GraphQLObjectType({
  name: 'WebLink',
  fields: {
    ...linkFields,
    url: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    }
  }
});

const MediaLinkType = new gql.GraphQLObjectType({
  name: 'MediaLink',
  fields: {
    ...linkFields,
    name: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    },
    url: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    },
    kind: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    },
    size: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    },
    width: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    },
    height: {
      type: new gql.GraphQLNonNull(gql.GraphQLString)
    }
  }
});

/**
 * Prismic image field.
 */
const ImageType = new gql.GraphQLScalarType({
  name: 'Image',
  description: 'A Prismic image object.',
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseObject
});

/**
 * Prismic image field.
 */
const SlicesType = new gql.GraphQLScalarType({
  name: 'Slices',
  description: 'A Prismic slice zone.',
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseObject
});

/**
 * Create a GraphQL interface for Prismic documents, and a Map to hold Prismic types that will
 * extend the interface.
 * @returns {CreateDocumentTypeReturn} Object containing the types map and document interface.
 */
const createDocumentType = () => {
  const typesMap = new Map();

  /**
   * Return value of `createDocumentType()`
   * @typedef {Object} CreateDocumentTypeReturn
   * @prop {Map.<String, Object>} typesMap - Types that will extend the document interface. The key should be a Prismic type API ID, and the value should be a GraphQL object type.
   * @prop {Object} DocumentType - GraphQL interface for Prismic documents.
   */
  return {
    typesMap,
    DocumentType: new gql.GraphQLInterfaceType({
      name: 'Document',
      fields: documentFields,
      resolveType(obj) {
        return typesMap.get(obj.type);
      }
    })
  };
};

/**
 * Create a GraphQL query type from a Document interface.
 * @param {Object} DocumentType - GraphQL Document interface.
 * @returns {Object} GraphQL query object type.
 */
const createQueryType = DocumentType => new gql.GraphQLObjectType({
  name: 'Query',
  fields: {
    getSingle: {
      type: DocumentType,
      args: {
        type: {
          type: new gql.GraphQLNonNull(gql.GraphQLString)
        }
      },
      async resolve(_, args, req) {
        const api = await getApi(req);
        return api.getSingle(args.type);
      }
    },
    getByUID: {
      type: DocumentType,
      args: {
        type: {
          type: new gql.GraphQLNonNull(gql.GraphQLString)
        },
        uid: {
          type: new gql.GraphQLNonNull(gql.GraphQLString)
        }
      },
      async resolve(_, args, req) {
        const api = await getApi(req);
        return api.getByUID(args.type, args.uid);
      }
    },
    getByID: {
      type: DocumentType,
      args: {
        id: {
          type: new gql.GraphQLNonNull(gql.GraphQLString)
        }
      },
      async resolve(_, args, req) {
        const api = await getApi(req);
        return api.getByID(args.id);
      }
    }
  }
});

module.exports = {
  createDocumentType,
  createQueryType,
  documentFields,
  ImageType,
  LinkType,
  DocumentLinkType,
  MediaLinkType,
  SlicesType,
  extraTypes: [DocumentLinkType, WebLinkType, MediaLinkType]
};
