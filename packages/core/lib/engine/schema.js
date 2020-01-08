// Generated by CoffeeScript 2.4.1
var Ajv, ajv_keywords;

Ajv = require('ajv');

ajv_keywords = require('ajv-keywords');

module.exports = function() {
  var ajv;
  ajv = new Ajv({
    $data: true,
    allErrors: true,
    useDefaults: true
  });
  // coerceTypes: true
  ajv_keywords(ajv);
  return {
    add: function(name, schema) {
      if (!schema) {
        return;
      }
      return ajv.addSchema(schema, name);
    },
    validate: function(data, schema) {
      var valid, validate;
      validate = ajv.compile(schema);
      valid = validate(data);
      if (validate.errors) {
        return validate.errors.map(function(error) {
          return Error(ajv.errorsText([error]));
        });
      } else {
        return [];
      }
    },
    list: function() {
      return {
        schemas: ajv._schemas,
        refs: ajv._refs,
        fragments: ajv._fragments
      };
    }
  };
};
