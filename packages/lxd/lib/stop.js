// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.stop`

// Stop a running Linux Container.

// ## Example

// ```
// require('nikita')
// .lxd.stop({
//   container: "myubuntu"
// }, function(err, {status}) {
//   console.info( err ? err.message : 'The container was stopped')
// });
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      $ref: 'module://@nikitajs/lxd/src/init#/properties/container'
    }
  },
  required: ['container']
};

// ## Handler
handler = function({config}) {
  // log message: "Entering stop", level: 'DEBUG', module: '@nikitajs/lxd/lib/stop'
  return this.execute({
    cmd: `lxc list -c ns --format csv | grep '${config.container},STOPPED' && exit 42
lxc stop ${config.container}`,
    code_skipped: 42
  });
};

// ## Export
module.exports = {
  handler: handler,
  schema: schema
};
