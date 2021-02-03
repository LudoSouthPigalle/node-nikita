// Generated by CoffeeScript 2.5.1
// # `nikita.db.database.wait`

// Wait for the creation of a database.

// ## Create Database example

// ```js
// const {status} = await nikita.db.wait({
//   admin_username: 'test',
//   admin_password: 'test',
//   database: 'my_db'
// })
// console.info(`Did database existed initially: ${!status}`)
// ```

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
      description: `The database name to wait for.`
    },
    'core': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/core'
    },
    'host': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/host'
    },
    'port': {
      $ref: 'module://@nikitajs/db/lib/query#/properties/port'
    }
  },
  required: ['admin_username', 'admin_password', 'database', 'engine', 'host']
};

// ## Handler
handler = async function({config}) {
  // Command
  return (await this.execute.wait({
    command: (function() {
      switch (config.engine) {
        case 'mariadb':
        case 'mysql':
          return command(config, {
            database: null
          }, "show databases") + ` | grep '${config.database}'`;
        case 'postgresql':
          return command(config, {
            database: null
          }, null) + ` -l | cut -d \\| -f 1 | grep -qw '${config.database}'`;
      }
    })()
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'database',
    global: 'db',
    schema: schema
  }
};

// ## Dependencies
({command} = require('../query'));
