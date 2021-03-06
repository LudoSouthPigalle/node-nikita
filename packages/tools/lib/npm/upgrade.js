// Generated by CoffeeScript 2.5.1
// # `nikita.tools.npm.upgrade`

// Upgrade all Node.js packages with NPM.

// ## Example

// The following action upgrades all global packages.

// ```js
// const {status} = await nikita.tools.npm.upgrade({
//   global: true
// })
// console.info(`Packages were upgraded: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'cwd': {
      $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/cwd'
    },
    'global': {
      type: 'boolean',
      default: false,
      description: `Upgrades global packages.`
    },
    'sudo': {
      $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/sudo'
    }
  },
  if: {
    properties: {
      'global': {
        const: false
      }
    }
  },
  then: {
    required: ['cwd']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var global, outdated, pkgs, stdout;
  global = config.global ? '-g' : '';
  // Get outdated packages
  outdated = [];
  ({stdout} = (await this.execute({
    command: `npm outdated --json ${global}`,
    code: [0, 1],
    cwd: config.cwd,
    stdout_log: false,
    metadata: {
      shy: true
    }
  })));
  pkgs = JSON.parse(stdout);
  if (Object.keys(pkgs).length) {
    outdated = Object.keys(pkgs);
  }
  // Upgrade outdated packages
  if (!outdated.length) {
    return;
  }
  await this.execute({
    command: `npm update ${global}`,
    cwd: config.cwd,
    sudo: config.sudo
  });
  return log({
    message: `NPM upgraded packages: ${outdated.join(', ')}`
  });
};

// ## Export
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};
