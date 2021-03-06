// Generated by CoffeeScript 2.5.1
// # `nikita.fs.base.mkdir`

// Create a directory. Missing parent directories are created as required.

// ## Hook
var errors, handler, on_action, schema, utils;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'gid': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      description: `Unix group id.`
    },
    'mode': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      description: `Permission mode, a bit-field describing the file type and mode.`
    },
    'target': {
      type: 'string',
      description: `Location of the file from where to obtain information.`
    },
    'uid': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      description: `Unix user id.`
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({config}) {
  var err;
  if (typeof config.mode === 'number') {
    // Convert mode into a string
    config.mode = config.mode.toString(8).substr(-4);
  }
  try {
    return (await this.execute([`[ -d '${config.target}' ] && exit 17`, ['install', config.mode ? `-m '${config.mode}'` : void 0, config.uid ? `-o '${config.uid}'` : void 0, config.gid ? `-g '${config.gid}'` : void 0, `-d '${config.target}'`].join(' ')].join('\n')));
  } catch (error) {
    err = error;
    if (err.exit_code === 17) {
      err = errors.NIKITA_FS_MKDIR_TARGET_EEXIST({
        config: config
      });
    }
    throw err;
  }
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    log: false,
    raw_output: true,
    schema: schema
  }
};

// ## Errors
errors = {
  NIKITA_FS_MKDIR_TARGET_EEXIST: function({config}) {
    return utils.error('NIKITA_FS_MKDIR_TARGET_EEXIST', ['fail to create a directory,', 'one already exists,', `location is ${JSON.stringify(config.target)}.`], {
      error_code: 'EEXIST',
      errno: -17,
      path: config.target_tmp || config.target, // Native Node.js api doesn't provide path
      syscall: 'mkdir'
    });
  }
};

// ## Dependencies
utils = require('../../../utils');
