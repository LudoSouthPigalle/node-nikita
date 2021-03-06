// Generated by CoffeeScript 2.5.1
// # `nikita.service.stop`

// Stop a service.
// Note, does not throw an error if service is not installed.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicates if the service was stopped ("true") or if it was already stopped 
//   ("false").   

// ## Example

// ```js
// const {status} = await nikita.service.stop([{
//   ssh: ssh,
//   name: 'gmetad'
// })
// console.info(`Service was stopped: ${status}`)
// ```

// ## Hooks
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (typeof metadata.argument === 'string') {
    return config.name = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    'arch_chroot': {
      $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/arch_chroot'
    },
    'name': {
      $ref: 'module://@nikitajs/service/lib/install#/properties/name'
    },
    'rootdir': {
      $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/rootdir'
    }
  },
  required: ['name']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var err, status;
  log({
    message: `Stop service ${config.name}`,
    level: 'INFO'
  });
  try {
    ({status} = (await this.execute({
      command: `ls /lib/systemd/system/*.service /etc/systemd/system/*.service /etc/rc.d/* /etc/init.d/* 2>/dev/null | grep -w "${config.name}" || exit 3
if command -v systemctl >/dev/null 2>&1; then
  systemctl status ${config.name} || exit 3
  systemctl stop ${config.name}
elif command -v service >/dev/null 2>&1; then
  service ${config.name} status || exit 3
  service ${config.name} stop
else
  echo "Unsupported Loader" >&2
  exit 2
fi`,
      code_skipped: 3,
      arch_chroot: config.arch_chroot,
      rootdir: config.rootdir
    })));
    if (status) {
      log({
        message: "Service is stopped",
        level: 'INFO'
      });
    }
    if (!status) {
      return log({
        message: "Service already stopped",
        level: 'WARN'
      });
    }
  } catch (error) {
    err = error;
    if (err.exit_code === 2) {
      throw Error("Unsupported Loader");
    }
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
