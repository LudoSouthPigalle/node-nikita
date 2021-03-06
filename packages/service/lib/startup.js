// Generated by CoffeeScript 2.5.1
// # `nikita.service.startup`

// Activate or desactivate a service on startup.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   Indicates if the startup behavior has changed.   

// ## Example

// ```js
// const {status} = await nikita.service.startup([{
//   ssh: ssh,
//   name: 'gmetad',
//   startup: false
// })
// console.info(`Service was desactivated on startup: ${status}`)
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
    },
    'startup': {
      type: ['boolean', 'string'],
      default: true,
      description: `Run service daemon on startup, required. A string represent a list of
activated levels, for example '2345' or 'multi-user'. An empty
string to not define any run level. Note: String argument is only
used if SysVinit runlevel is installed on the OS (automatically
detected by nikita).`
    }
  },
  required: ['name']
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var c, command, current_startup, err, i, j, k, len, level, message, ref, ref1, startup_off, startup_on, status, stderr, stdout;
  // Action
  log({
    message: `Startup service ${config.name}`,
    level: 'INFO'
  });
  if (!config.command) {
    ({stdout} = (await this.execute({
      command: `if command -v systemctl >/dev/null 2>&1; then
  echo 'systemctl'
elif command -v chkconfig >/dev/null 2>&1; then
  echo 'chkconfig'
elif command -v update-rc.d >/dev/null 2>&1; then
  echo 'update-rc'
else
  echo "Unsupported Loader" >&2
  exit 2
fi`,
      metadata: {
        shy: true
      }
    })));
    config.command = stdout.trim();
    if ((ref = config.command) !== 'systemctl' && ref !== 'chkconfig' && ref !== 'update-rc') {
      throw Error("Unsupported Loader");
    }
  }
  switch (config.command) {
    case 'systemctl':
      try {
        ({status} = (await this.execute({
          command: `startup=${config.startup ? '1' : ''}
if systemctl is-enabled ${config.name}; then
  [ -z "$startup" ] || exit 3
  echo 'Disable ${config.name}'
  systemctl disable ${config.name}
else
  [ -z "$startup" ] && exit 3
  echo 'Enable ${config.name}'
  systemctl enable ${config.name}
fi`,
          trap: true,
          code_skipped: 3,
          arch_chroot: config.arch_chroot,
          rootdir: config.rootdir
        })));
        message = config.startup ? 'activated' : 'disabled';
        return log(status ? {
          message: `Service startup updated: ${message}`,
          level: 'WARN',
          module: 'nikita/lib/service/remove'
        } : {
          message: `Service startup not modified: ${message}`,
          level: 'INFO',
          module: 'nikita/lib/service/remove'
        });
      } catch (error) {
        err = error;
        if (config.startup) {
          throw Error(`Startup Enable Failed: ${config.name}`);
        }
        if (!config.startup) {
          throw Error(`Startup Disable Failed: ${config.name}`);
        }
      }
      break;
    case 'chkconfig':
      ({status, stdout, stderr} = (await this.execute({
        command: `chkconfig --list ${config.name}`,
        code_skipped: 1,
        metadata: {
          shy: true
        }
      })));
      // Invalid service name return code is 0 and message in stderr start by error
      if (/^error/.test(stderr)) {
        log({
          message: `Invalid chkconfig name for \"${config.name}\"`,
          level: 'ERROR'
        });
        throw Error(`Invalid chkconfig name for \`${config.name}\``);
      }
      current_startup = '';
      if (status) {
        ref1 = stdout.split(' ').pop().trim().split('\t');
        for (j = 0, len = ref1.length; j < len; j++) {
          c = ref1[j];
          [level, status] = c.split(':');
          if (['on', 'marche'].indexOf(status) > -1) {
            current_startup += level;
          }
        }
      }
      if (config.startup === true && current_startup.length) {
        return;
      }
      if (config.startup === current_startup) {
        return;
      }
      if (status && config.startup === false && current_startup === '') {
        return;
      }
      if (config.startup) {
        command = `chkconfig --add ${config.name};`;
        if (typeof config.startup === 'string') {
          startup_on = startup_off = '';
          for (i = k = 0; k < 6; i = ++k) {
            if (config.startup.indexOf(i) !== -1) {
              startup_on += i;
            } else {
              startup_off += i;
            }
          }
          if (startup_on) {
            command += `chkconfig --level ${startup_on} ${config.name} on;`;
          }
          if (startup_off) {
            command += `chkconfig --level ${startup_off} ${config.name} off;`;
          }
        } else {
          command += `chkconfig ${config.name} on;`;
        }
        await this.execute({
          command: command
        });
      }
      if (!config.startup) {
        log({
          message: "Desactivating startup rules",
          level: 'DEBUG'
        });
        // Setting the level to off. An alternative is to delete it: `chkconfig --del #{config.name}`
        await this.execute({
          command: `chkconfig ${config.name} off`
        });
      }
      message = config.startup ? 'activated' : 'disabled';
      return log(status ? {
        message: `Service startup updated: ${message}`,
        level: 'WARN',
        module: 'nikita/lib/service/startup'
      } : {
        message: `Service startup not modified: ${message}`,
        level: 'INFO',
        module: 'nikita/lib/service/startup'
      });
    case 'update-rc':
      ({status} = (await this.execute({
        command: `startup=${config.startup ? '1' : ''}
if ls /etc/rc*.d/S??${config.name}; then
  [ -z "$startup" ] || exit 3
  echo 'Disable ${config.name}'
  update-rc.d -f ${config.name} disable
else
  [ -z "$startup" ] && exit 3
  echo 'Enable ${config.name}'
  update-rc.d -f ${config.name} enable
fi`,
        code_skipped: 3,
        arch_chroot: config.arch_chroot,
        rootdir: config.rootdir
      })));
      message = config.startup ? 'activated' : 'disabled';
      return log(status ? {
        message: `Service startup updated: ${message}`,
        level: 'WARN',
        module: 'nikita/lib/service/remove'
      } : {
        message: `Service startup not modified: ${message}`,
        level: 'INFO',
        module: 'nikita/lib/service/remove'
      });
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
