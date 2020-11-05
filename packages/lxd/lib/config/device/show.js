// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.config.device.show`

// Show full device configuration for containers or profiles.

// ## Output parameters

// * `err`
//   Error object if any.
// * `result.status` (boolean)
//   True if the device was created or the configuraion updated.
// * `result.config` (object)   
//   Device configuration.

// ## Example

// ```js
// require('nikita')
// .lxd.config.device.show({
//   container: 'container1',
//   device: 'vpn'
// }, function(err, {config}){
//   console.info( err ? err.message : config);
//   # { connect: "udp:127.0.0.1:1194",
//   #   listen: "udp:51.68.116.44:1194",
//   #   type: proxy } }
// })
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      $ref: 'module://@nikitajs/lxd/src/init#/properties/container'
    },
    'device': {
      type: 'string',
      description: `Name of the device in LXD configuration, for example "eth0".`
    }
  },
  required: ['container', 'device']
};

// ## Handler
handler = async function({config}) {
  var stdout;
  // log message: "Entering lxd config.device.show", level: "DEBUG", module: "@nikitajs/lxd/lib/config/device/show"
  ({stdout} = (await this.execute({
    cmd: ['lxc', 'query', '/' + ['1.0', 'instances', config.container].join('/')].join(' ')
  })));
  stdout = JSON.parse(stdout);
  return {
    status: true,
    config: stdout.devices[config.device]
  };
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema,
  metadata: {
    shy: true
  }
};
