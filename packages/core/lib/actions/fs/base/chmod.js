// Generated by CoffeeScript 2.5.1
// # `nikita.fs.base.chmod`

// Change permissions of a file.

// ## Hook
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.target = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'mode': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'string'
        }
      ],
      default: 0o644,
      description: `File mode. Modes may be absolute or symbolic. An absolute mode is
an octal number. A symbolic mode is a string with a particular syntax
describing \`who\`, \`op\` and \`perm\` symbols.`
    },
    'target': {
      type: 'string',
      description: `Location of the file which permission will change.`
    }
  },
  required: ['mode', 'target']
};

// ## Handler
handler = async function({config}) {
  if (typeof config.mode === 'number') {
    config.mode = config.mode.toString(8).substr(-4);
  }
  return (await this.execute({
    command: `chmod ${config.mode} ${config.target}`
  }));
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
