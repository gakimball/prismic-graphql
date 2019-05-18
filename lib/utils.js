const {Kind} = require('graphql/language');

const identity = e => e;

const parseObject = ast => {
  if (ast.kind === Kind.OBJECT) {
    const obj = {};

    ast.fields.forEach(field => {
      obj[field.name.value] = parseObject(field.value);
    });

    return obj;
  }

  return undefined;
};

module.exports = {
  identity,
  parseObject
};
