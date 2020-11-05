// Generated by CoffeeScript 2.5.1
// # `nikita.lxd.network`

// Create a network or update a network configuration

// ## Callback parameters

// * `err`
//   Error object if any
// * `status`
//   True if the network was created/updated

// ## Example

// ```js
// require('nikita')
// .lxd.network({
//   network: 'lxbr0'
//   config: {
//     'ipv4.address': '172.89.0.0/24',
//     'ipv6.address': 'none'
//   }
// }, function(err, {status}){
//   console.info( err ? err.message : 'Network created: ' + status);
// })
// ```

// ## Schema
var diff, handler, schema, yaml;

schema = {
  type: 'object',
  properties: {
    'network': {
      type: 'string',
      description: `The network name to create.`
    },
    'config': {
      type: 'object',
      patternProperties: {
        '': {
          type: ['string', 'boolean', 'number']
        }
      },
      description: `The network configuration, see [available
fields](https://lxd.readthedocs.io/en/latest/networks/).`
    }
  },
  required: ['network']
};

// ## Handler
handler = async function({config}) {
  var changes, code, config_orig, k, key, ref, status, stdout, v, value;
  ref = config.config;
  // log message: "Entering lxd.network", level: "DEBUG", module: "@nikitajs/lxd/lib/network"
  // Normalize config
  for (k in ref) {
    v = ref[k];
    if (typeof v === 'string') {
      continue;
    }
    config.config[k] = v.toString();
  }
  // Command if the network does not yet exist
  ({stdout, code, status} = (await this.execute({
    // return code 5 indicates a version of lxc where 'network' command is not implemented
    cmd: `lxc network > /dev/null || exit 5
lxc network show ${config.network} && exit 42
${[
      'lxc',
      'network',
      'create',
      config.network,
      ...((function() {
        var ref1,
      results;
        ref1 = config.config;
        results = [];
        for (key in ref1) {
          value = ref1[key];
          results.push(`${key}='${value.replace('\'',
      '\\\'')}'`);
        }
        return results;
      })())
    ].join(' ')}`,
    code_skipped: [5, 42]
  })));
  if (code === 5) {
    throw Error("This version of lxc does not support the network command.");
  }
  if (code !== 42) { // was created
    return {
      status: status
    };
  }
  // Network already exists, find the changes
  if (!(config != null ? config.config : void 0)) {
    return;
  }
  config_orig = config;
  ({config} = yaml.safeLoad(stdout));
  changes = diff(config, config_orig.config);
  for (key in changes) {
    value = changes[key];
    ({status} = (await this.execute({
      cmd: ['lxc', 'network', 'set', config_orig.network, key, `'${value.replace('\'', '\\\'')}'`].join(' ')
    })));
  }
  return {
    status: status
  };
};

// ## Export
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
yaml = require('js-yaml');

diff = require('object-diff');
