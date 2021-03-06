// Generated by CoffeeScript 2.5.1
// # `nikita.service.assert`

// Assert service information and status.

// The option "action" takes 3 possible values: "start", "stop" and "restart". A 
// service will only be restarted if it leads to a change of status. Set the value 
// to "['start', 'restart']" to ensure the service will be always started.

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
    'installed': {
      type: 'boolean',
      description: `Assert the package is installed.`
    },
    'name': {
      $ref: 'module://@nikitajs/service/lib/install#/properties/name'
    },
    'rootdir': {
      $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/rootdir'
    },
    'srv_name': {
      type: 'string',
      description: `Name used by the service utility, default to "name".`
    },
    'started': {
      type: 'boolean',
      description: `Assert if started.`
    },
    'stopped': {
      type: 'boolean',
      description: `Assert if stopped.`
    }
  },
  required: ['name']
};

// ## Handler
handler = async function({config, metadata}) {
  var err, status;
  if (config.srv_name == null) {
    config.srv_name = config.name;
  }
  config.name = [config.name];
  // Assert a Package is installed
  if (config.installed != null) {
    try {
      await this.execute({
        command: `if command -v yum >/dev/null 2>&1; then
  rpm -qa --qf "%{NAME}\n" | grep '^${config.name.join('|')}$'
elif command -v pacman >/dev/null 2>&1; then
  pacman -Qqe | grep '^${config.name.join('|')}$'
elif command -v apt-get >/dev/null 2>&1; then
  dpkg -l | grep \'^ii\' | awk \'{print $2}\' | grep '^${config.name.join('|')}$'
else
  echo "Unsupported Package Manager" >&2
  exit 2
fi`,
        arch_chroot: config.arch_chroot,
        rootdir: config.rootdir,
        stdin_log: true,
        stdout_log: false,
        metadata: {
          shy: true
        }
      });
    } catch (error) {
      err = error;
      if (err.exit_code === 2) {
        throw Error("Unsupported Package Manager");
      }
      throw Error(`Uninstalled Package: ${config.name}`);
    }
  }
  // Assert a Service is started or stopped
  // Note, this doesnt check wether a service is installed or not.
  if (!((config.started != null) || (config.stopped != null))) {
    return;
  }
  try {
    ({status} = (await this.execute({
      command: `ls /lib/systemd/system/*.service /etc/systemd/system/*.service /etc/rc.d/* /etc/init.d/* 2>/dev/null | grep -w "${config.srv_name}" || exit 3
if command -v systemctl >/dev/null 2>&1; then
  systemctl status ${config.srv_name} || exit 3
elif command -v service >/dev/null 2>&1; then
  service ${config.srv_name} status || exit 3
else
  echo "Unsupported Loader" >&2
  exit 2
fi`,
      code: 0,
      code_skipped: 3,
      arch_chroot: config.arch_chroot,
      rootdir: config.rootdir
    })));
  } catch (error) {
    err = error;
    if (err.exit_code === 2) {
      throw Error("Unsupported Loader");
    }
  }
  if (config.started != null) {
    if (config.started && !status) {
      throw Error(`Service Not Started: ${config.srv_name}`);
    }
    if (!config.started && status) {
      throw Error(`Service Started: ${config.srv_name}`);
    }
  }
  if (config.stopped != null) {
    if (config.stopped && status) {
      throw Error(`Service Not Stopped: ${config.srv_name}`);
    }
    if (!config.stopped && !status) {
      throw Error(`Service Stopped: ${config.srv_name}`);
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
