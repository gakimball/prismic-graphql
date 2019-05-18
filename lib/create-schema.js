const gql = require('graphql');
const folderToObject = require('folder-to-object');
const mapValues = require('lodash/mapValues');
const fromPairs = require('lodash/fromPairs');
const forEach = require('lodash/forEach');
const camelcase = require('camelcase');
const {createDocumentType, createQueryType, documentFields, ImageType, LinkType, DocumentLinkType, MediaLinkType, extraTypes, SlicesType} = require('./types');

/**
 * Convert a string identifier to a GraphQL type name.
 * @param {String} str - Input identifier.
 * @returns {String} GraphQL type name.
 * @private
 */
const toType = str => camelcase(str, {pascalCase: true});

/**
 * Convert a series of Prismic fields into a series of GraphQL fields.
 * @param {String} name - Name of the Prismic type or field.
 * @param {(Object.<String, Object>|Object[])} fields - Prismic fields to convert.
 * @param {Boolean} base - If `true`, fields are from a Prismic custom type. If `false`, fields are from a group.
 * @returns {Object.<String, Object>} Object of fields to use in a GraphQL object definition.
 * @private
 */
const fieldsToTypes = (name, fields, base = false) => {
  const typeFields = (() => {
    // `base = true` means we're looking at the fields of of a Prismic custom type
    // Custom type fields are sorted into tabs, which we flatten into one big array
    if (base) {
      return Object.assign({}, ...Object.values(fields));
    }

    // `base = false` means we're looking at the fields of a group, which are in a simple array
    return fields;
  })();

  // Convert each Prismic field schema into an equivalent GraphQL field schema
  return mapValues(typeFields, (field, key) => {
    switch (field.type) {
      case 'Image':
        return {
          type: ImageType
        };
      case 'Select':
        return {
          type: new gql.GraphQLNonNull(new gql.GraphQLEnumType({
            name: `${name}${toType(key)}`,
            values: fromPairs(field.config.options.map(option => [
              option.replace(/\s*/g, '').toUpperCase(),
              {value: option}
            ]))
          }))
        };
      case 'Group': {
        const groupTypeName = `${name}${toType(key)}`;

        return {
          type: new gql.GraphQLNonNull(new gql.GraphQLList(
            new gql.GraphQLObjectType({
              name: groupTypeName,
              fields: fieldsToTypes(groupTypeName, field.config.fields)
            })
          ))
        };
      }
      case 'UID':
        return {
          type: new gql.GraphQLNonNull(gql.GraphQLString)
        };
      case 'Link':
        switch (field.config.select) {
          case 'document':
            return {
              type: DocumentLinkType
            };
          case 'media':
            return {
              type: MediaLinkType
            };
          default: // Can be web, document, or media
            return {
              type: LinkType
            };
        }
      case 'Slices':
        return {
          type: new gql.GraphQLNonNull(SlicesType)
        };
      case 'Text':
      case 'Date':
      case 'Color':
      case 'Timestamp':
      case 'Number': // @TODO
      case 'StructuredText': // @TODO
      case 'Embed': // @TODO
      case 'GeoPoint': // @TODO
      default:
        return {
          type: gql.GraphQLString
        };
    }
  });
};

/**
 * Create a GraphQL type from a Prismic schema.
 * @param {String} name - API ID of the Prismic type.
 * @param {Object} fields - JSON schema of the Prismic type.
 * @param {Object} DocumentType - GraphQL interface that the type extends.
 * @returns {Object} GraphQL object type.
 * @private
 */
const createPrismicType = (name, fields, DocumentType) => {
  const typeName = toType(name);

  return new gql.GraphQLObjectType({
    name: typeName,
    interfaces: [DocumentType],
    fields: {
      ...documentFields,
      data: {
        type: new gql.GraphQLNonNull(new gql.GraphQLObjectType({
          name: `${typeName}Data`,
          fields: fieldsToTypes(typeName, fields, true)
        }))
      }
    }
  });
};

/**
 * Create a GraphQL schema from a folder of Prismic JSON schemas.
 * @param {String} dir - Folder containing JSON files. The name of each file should match the API ID of the Prismic content type.
 * @returns {Promise.<Object>} GraphQL schema.
 */
module.exports = async dir => {
  const schemas = await folderToObject(dir);
  const {typesMap, DocumentType} = createDocumentType();
  const QueryType = createQueryType(DocumentType);

  forEach(schemas, (value, key) => {
    typesMap.set(key, createPrismicType(key, value, DocumentType));
  });

  return new gql.GraphQLSchema({
    query: QueryType,
    types: [...typesMap.values(), ...extraTypes]
  });
};
