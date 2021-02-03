// Generated by CoffeeScript 2.5.1
// # `nikita.service.remove`

// Remove a package or service.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicates if the startup behavior has changed.   

// ## Example

// ```js
// const {status} = await nikita.service.remove([{
//   ssh: ssh,
//   name: 'gmetad'
// })
// console.info(`Package or service was removed: ${status}`)
// ```

// ## Hooks
var handler, on_action, schema, utils;

on_action = function({config, metadata}) {
  if (typeof metadata.argument === 'string') {
    return config.name = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'cache': {
      type: 'boolean',
      description: `Run entirely from system cache to list installed and outdated
packages.`
    },
    'cacheonly': {
      $ref: 'module://@nikitajs/service/lib/install#/properties/cacheonly'
    },
    'name': {
      $ref: 'module://@nikitajs/service/lib/install#/properties/name'
    }
  },
  // 'ssh':  # not supported
  //   type: 'object'
  //   description: """
  //   Run the action on a remote server using SSH, an ssh2 instance or an
  //   configuration object used to initialize the SSH connection.
  //   """
  required: ['name']
};

// ## Handler
handler = async function({
    config,
    parent: {state},
    tools: {log}
  }) {
  var cacheonly, err, installed, pkg, status, stdout;
  // config.manager ?= state['nikita:service:manager'] # not supported
  log({
    message: `Remove service ${config.name}`,
    level: 'INFO'
  });
  cacheonly = config.cacheonly ? '-C' : '';
  if (config.cache) {
    installed = state['nikita:execute:installed'];
  }
  if (installed == null) {
    try {
      ({status, stdout} = (await this.execute({
        command: `if command -v yum >/dev/null 2>&1; then
  rpm -qa --qf "%{NAME}\n"
elif command -v pacman >/dev/null 2>&1; then
  pacman -Qqe
elif command -v apt-get >/dev/null 2>&1; then
  dpkg -l | grep \'^ii\' | awk \'{print $2}\'
else
  echo "Unsupported Package Manager" >&2
  exit 2
fi`,
        code_skipped: 1,
        stdout_log: false,
        metadata: {
          shy: true
        }
      })));
      if (status) {
        log({
          message: "Installed packages retrieved",
          level: 'INFO'
        });
        installed = (function() {
          var i, len, ref, results;
          ref = utils.string.lines(stdout);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            pkg = ref[i];
            results.push(pkg);
          }
          return results;
        })();
      }
    } catch (error) {
      err = error;
      if (err.exit_code === 2) {
        throw Error("Unsupported Package Manager");
      }
    }
  }
  if (installed.indexOf(config.name) !== -1) {
    try {
      ({status} = (await this.execute({
        command: `if command -v yum >/dev/null 2>&1; then
  yum remove -y ${cacheonly} '${config.name}'
elif command -v pacman >/dev/null 2>&1; then
  pacman --noconfirm -R ${config.name}
elif command -v apt-get >/dev/null 2>&1; then
  apt-get remove -y ${config.name}
else
  echo "Unsupported Package Manager: yum, pacman, apt-get supported" >&2
  exit 2
fi`,
        code_skipped: 3
      })));
      // Update list of installed packages
      installed.splice(installed.indexOf(config.name), 1);
      // Log information
      log(status ? {
        message: "Service removed",
        level: 'WARN',
        module: 'nikita/lib/service/remove'
      } : {
        message: "Service already removed",
        level: 'INFO',
        module: 'nikita/lib/service/remove'
      });
    } catch (error) {
      err = error;
      if (err) {
        throw Error(`Invalid Service Name: ${config.name}`);
      }
    }
  }
  if (config.cache) {
    return (await this.call({
      handler: function() {
        log({
          message: "Caching installed on \"nikita:execute:installed\"",
          level: 'INFO'
        });
        return state['nikita:execute:installed'] = installed;
      }
    }));
  }
};

// ## Export
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    schema: schema
  }
};

// ## Dependencies
utils = require('@nikitajs/core/lib/utils');
