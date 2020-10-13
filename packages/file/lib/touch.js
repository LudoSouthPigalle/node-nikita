// Generated by CoffeeScript 2.5.1
// # `nikita.file.touch`

// Create a empty file if it does not yet exists.

// ## Implementation details

// Status will only be true if the file was created.

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if file was created or modified.   

// ## Example

// ```js
// require('nikita')
// .file.touch({
//   ssh: ssh,
//   target: '/tmp/a_file'
// }, function(err, {status}){
//   console.log(err ? err.message : 'File touched: ' + status);
// });
// ```

// ## On config
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    // Options
    return config.target = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'gid': {
      $ref: 'module://@nikitajs/engine/src/actions/fs/base/chown#/properties/gid'
    },
    'mode': {
      $ref: 'module://@nikitajs/engine/src/actions/fs/base/chmod#/properties/mode'
    },
    'target': {
      oneOf: [
        {
          type: 'string'
        },
        {
          typeof: 'function'
        }
      ],
      description: `File path where to write file or a function that returns a valid file path.`
    },
    'uid': {
      $ref: 'module://@nikitajs/engine/src/actions/fs/base/chown#/properties/uid'
    }
  },
  required: ['target']
};

// ## Handler
handler = async function({config, log}) {
  var status;
  log({
    message: "Entering file.touch",
    level: 'DEBUG',
    module: 'nikita/lib/file/touch'
  });
  // status is false if the file doesn't exist and true otherwise
  ({status} = (await this.call(async function() {
    var exists;
    log({
      message: `Check if target exists \"${config.target}\"`,
      level: 'DEBUG',
      module: 'nikita/lib/file/touch'
    });
    ({exists} = (await this.fs.base.exists({
      target: config.target
    })));
    if (!exists) {
      log({
        message: "Destination does not exists",
        level: 'INFO',
        module: 'nikita/lib/file/touch'
      });
    }
    return !exists;
  })));
  // if the file doesn't exist, create a new one
  if (status) {
    this.file({
      content: '',
      target: config.target,
      mode: config.mode,
      uid: config.uid,
      gid: config.gid
    });
  } else {
    // todo check uid/gid/mode
    // if the file exists, overwrite it using `touch` but don't update the status
    this.execute({
      cmd: `touch ${config.target}`,
      shy: true
    });
  }
  return {};
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  schema: schema
};