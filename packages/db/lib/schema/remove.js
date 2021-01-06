// Generated by CoffeeScript 2.5.1
// # `nikita.db.schema.remove`

// Remove a schema from a database.

// ## Schema
var command, handler, schema;

schema = {
  type: 'object',
  properties: {
    'admin_username': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/admin_username'
    },
    'admin_password': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/admin_password'
    },
    'database': {
      type: 'string',
      description: `The database name where the schema is registered.`
    },
    'engine': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/engine'
    },
    'host': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/host'
    },
    'port': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/port'
    },
    'schema': {
      type: 'string',
      description: `New schema name.`
    }
  },
  required: ['admin_username', 'admin_password', 'database', 'engine', 'host', 'schema']
};

// ## Handler
handler = async function({config}) {
  var exists;
  ({exists} = (await this.db.schema.exists({
    config: config
  })));
  if (!exists) {
    return false;
  }
  return (await this.db.query({
    config: config
  }, {
    command: `DROP SCHEMA IF EXISTS ${config.schema};`
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_name: 'schema',
    global: 'db',
    schema: schema
  }
};

// ## Dependencies
({command} = require('../query'));
