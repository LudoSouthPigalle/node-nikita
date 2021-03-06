// Generated by CoffeeScript 2.5.1
// # `nikita.execute`

// Run a command locally or with ssh if `host` or `ssh` is provided.

// ## Exit codes

// The properties "code" and "code_skipped" are important to determine whether an
// action failed or succeed with or without modifications. An action is expected to
// execute successfully with modifications if the exit code match one of the value
// in "code", by default "0". Otherwise, it is considered to have failed and an
// error is passed to the user callback. The "code_skipped" option is used to
// define one or more exit codes that are considered successfull but without
// creating any modifications.

// ## Output

// * `info.status`   
//   Value is "true" if command exit equals option "code", "0" by default, "false" if
//   command exit equals option "code_skipped", none by default.
// * `info.stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `info.stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Temporary directory

// A temporary directory is required under certain conditions. The action leverages
// the `tmpdir` plugins which is only activated when necessary. The conditions
// involves the usage of `sudo`, `chroot`, `arch_chroot` or `env_export`.

// For performance reason, consider declare the `metadata.tmpdir` property in your
// parent action to avoid the creation and removal of a tempory directory everytime
// the `execute` action is called.

// ## Events

// * `stdout`
// * `stdout_stream`
// * `stderr`
// * `stderr_stream`

// ## Create a user over SSH

// This example create a user on a remote server with the `useradd` command. It
// print the error message if the command failed or an information message if it
// succeed.

// An exit code equal to "9" defined by the "code_skipped" option indicates that
// the command is considered successfull but without any impact.

// ```js
// const {status} = await nikita.execute({
//   ssh: ssh,
//   command: 'useradd myfriend',
//   code_skipped: 9
// })
// console.info(`User was created: ${status}`)
// ```

// ## Run a command with bash

// ```js
// const {stdout} = await nikita.execute({
//   bash: true,
//   command: 'env'
// })
// console.info(stdout)
// ```

// ## Hooks
var exec, handler, merge, on_action, schema, utils, yaml;

on_action = {
  after: ['@nikitajs/core/lib/plugins/ssh'],
  // '@nikitajs/core/lib/plugins/tools_find'
  // '@nikitajs/core/lib/plugins/tools_walk'
  before: ['@nikitajs/core/lib/plugins/schema', '@nikitajs/core/lib/metadata/tmpdir'],
  handler: async function({
      config,
      metadata,
      ssh,
      tools: {find, walk}
    }) {
    var env, env_export, sudo;
    sudo = (await find(function({
        config: {sudo}
      }) {
      return sudo;
    }));
    env = merge({}, ...(await walk(function({
        config: {env}
      }) {
      return env;
    })));
    if (!(ssh || Object.keys(env).length)) {
      if (config.env == null) {
        config.env = process.env;
      }
    }
    env_export = config.env_export != null ? config.env_export : !!ssh;
    if (sudo || config.bash || config.arch_chroot || (Object.keys(env).length && env_export)) {
      metadata.tmpdir = true;
    }
    if (metadata.argument != null) {
      config.command = metadata.argument;
    }
    if ((config.code != null) && !Array.isArray(config.code)) {
      config.code = [config.code];
    }
    if ((config.code_skipped != null) && !Array.isArray(config.code_skipped)) {
      return config.code_skipped = [config.code_skipped];
    }
  }
};


// ## Schema
schema = {
  type: 'object',
  properties: {
    'arch_chroot': {
      oneOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string'
        }
      ],
      description: `Run this command inside a root directory with the arc-chroot command
or any provided string, require the "rootdir" option if activated.`
    },
    'bash': {
      oneOf: [
        {
          type: 'boolean'
        },
        {
          type: 'string'
        }
      ],
      description: `Serialize the command into a file and execute it with bash.`
    },
    'rootdir': {
      type: 'string',
      description: `Path to the mount point corresponding to the root directory, required
if the "arch_chroot" option is activated.`
    },
    'command': {
      oneOf: [
        {
          type: 'string'
        },
        {
          typeof: 'function'
        }
      ],
      description: `String, Object or array; Command to execute. A value provided as a
function is interpreted as an action and will be called by forwarding
the config object. The result is the expected to be the command
to execute.`
    },
    'cwd': {
      type: 'string',
      description: `Current working directory from where to execute the command.`
    },
    'code': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'array',
          items: {
            type: 'integer'
          }
        }
      ],
      default: [0],
      description: `Expected code(s) returned by the command, int or array of int, default
to 0.`
    },
    'code_skipped': {
      oneOf: [
        {
          type: 'integer'
        },
        {
          type: 'array',
          items: {
            type: 'integer'
          }
        }
      ],
      default: [],
      description: `Expected code(s) returned by the command if it has no effect, executed
will not be incremented, int or array of int.`
    },
    'dirty': {
      type: 'boolean',
      default: false,
      description: `Leave temporary files on the filesystem.`
    },
    'dry': {
      type: 'boolean',
      description: `Run the action without executing any real command.`
    },
    'env': {
      type: 'object',
      description: `Environment variables as key-value pairs. With local execution, it
default to \`process.env\`. With remote execution over SSH, the accepted
environment variables is determined by the AcceptEnv server setting
and default to "LANG,LC_*". See the \`env_export\` property to get
around this limitation.`,
      patternProperties: {
        '': {
          type: "string"
        }
      }
    },
    'env_export': {
      type: 'boolean',
      description: `Write a temporary file which exports the the environment variables
defined in the \`env\` property. The value is always \`true\` when
environment variables must be used with SSH.`
    },
    'format': {
      type: 'string',
      enum: ['json', 'yaml'],
      description: `Convert the stdout to a Javascript value or object.`
    },
    'gid': {
      type: 'integer',
      description: `Unix group id.`
    },
    'stdin_log': {
      type: 'boolean',
      default: true,
      description: `Log the executed command of type stdin, default is \`true\`.`
    },
    'stdout': {
      instanceof: 'Object', // must be `stream.Writable`
      description: `Writable EventEmitter in which the standard output of executed
commands will be piped.`
    },
    'stdout_return': {
      type: 'boolean',
      default: true,
      description: `Return the stderr content in the output, default is \`true\`.  It is
preferable to set this property to \`false\` and to use the \`stdout\`
property when expecting a large stdout output.`
    },
    'stdout_log': {
      type: 'boolean',
      default: true,
      description: `Pass stdout output to the logs of type "stdout_stream", default is
\`true\`.`
    },
    'stdout_trim': {
      type: 'boolean',
      default: false,
      description: `Trim the stdout output.`
    },
    'stderr': {
      instanceof: 'Object', // must be `stream.Writable`
      description: `Writable EventEmitter in which the standard error output of executed
command will be piped.`
    },
    'stderr_return': {
      type: 'boolean',
      default: true,
      description: `Return the stderr content in the output, default is \`true\`. It is
preferable to set this property to \`false\` and to use the \`stderr\`
property when expecting a large stderr output.`
    },
    'stderr_log': {
      type: 'boolean',
      default: true,
      description: `Pass stdout output to the logs of type "stdout_stream", default is
\`true\`.`
    },
    'stderr_trim': {
      type: 'boolean',
      default: false,
      description: `Trim the stderr output.`
    },
    'sudo': {
      type: 'boolean',
      // default: false
      description: `Run a command as sudo, desactivated if user is "root".`
    },
    'target': {
      type: 'string',
      description: `Temporary path storing the script, only apply with the \`bash\` and
\`arch_chroot\` properties, always disposed once executed. Unless
provided, the default location is \`{metadata.tmpdir}/{string.hash
config.command}\`. See the \`tmpdir\` plugin for additionnal information.`
    },
    'trap': {
      type: 'boolean',
      default: false,
      description: `Exit immediately if a commands exits with a non-zero status.`
    },
    'trim': {
      type: 'boolean',
      default: false,
      description: `Trim both the stdout and stderr outputs.`
    },
    'uid': {
      type: 'integer',
      description: `Unix user id.`
    }
  },
  dependencies: {
    arch_chroot: {
      required: ['rootdir']
    }
  },
  required: ['command']
};


// ## Handler
handler = async function({
    config,
    metadata,
    parent,
    tools: {dig, find, log, path, walk},
    ssh
  }) {
  var command, current_username, dry, env, env_export, env_export_content, env_export_hash, env_export_target, k, stdout, sudo, v;
  // Validate parameters
  if (config.mode == null) {
    config.mode = 0o500;
  }
  if (typeof config.command === 'function') {
    config.command = (await this.call({
      config: config
    }, config.command));
  }
  if (config.bash === true) {
    config.bash = 'bash';
  }
  if (config.arch_chroot === true) {
    config.arch_chroot = 'arch-chroot';
  }
  if (config.command && config.trap) {
    config.command = `set -e\n${config.command}`;
  }
  config.command_original = `${config.command}`;
  sudo = (await find(function({
      config: {sudo}
    }) {
    return sudo;
  }));
  dry = (await find(function({
      config: {dry}
    }) {
    return dry;
  }));
  if (['bash', 'arch_chroot'].filter(function(k) {
    return config[k];
  }).length > 1) {
    // TODO move next 2 lines this to schema or on_action ?
    throw Error("Incompatible properties: bash, arch_chroot");
  }
  // throw Error "Required Option: \"rootdir\" with \"arch_chroot\"" if config.arch_chroot and not config.rootdir
  // Environment variables are merged with parent
  env = merge({}, ...(await walk(function({
      config: {env}
    }) {
    return env;
  })));
  // Serialize env in a sourced file
  env_export = config.env_export != null ? config.env_export : !!ssh;
  if (env_export && Object.keys(env).length) {
    env_export_content = ((function() {
      var results;
      results = [];
      for (k in env) {
        v = env[k];
        results.push(`export ${k}=${utils.string.escapeshellarg(v)}\n`);
      }
      return results;
    })()).join('\n');
    env_export_hash = utils.string.hash(env_export_content);
  }
  // Guess current username
  current_username = ssh ? ssh.config.username : /^win/.test(process.platform) ? process.env['USERPROFILE'].split(path.win32.sep)[2] : process.env['USER'];
  // Sudo
  if (sudo) {
    if (current_username === 'root') {
      sudo = false;
    } else {
      if (!['bash', 'arch_chroot'].some(function(k) {
        return config[k];
      })) {
        config.bash = 'bash';
      }
    }
  }
  // User substitution
  // Determines if writing is required and eventually convert uid to username
  if (config.uid && current_username !== 'root' && !/\d/.test(`${config.uid}`)) {
    ({stdout} = (await this.execute({
      [`awk -v val=${config.uid} -F `]: " '$3==val{print $1}' /etc/passwd`"
    }, function(err, {stdout}) {})));
    config.uid = stdout.trim();
    if (!(config.bash || config.arch_chroot)) {
      config.bash = 'bash';
    }
  }
  if (env_export && Object.keys(env).length) {
    env_export_hash = utils.string.hash(env_export_content);
    env_export_target = path.join(metadata.tmpdir, env_export_hash);
    config.command = `source ${env_export_target}\n${config.command}`;
    log({
      message: `Writing env export to ${JSON.stringify(env_export_target)}`,
      level: 'INFO'
    });
    await this.fs.base.writeFile({
      content: env_export_content,
      mode: 0o500,
      sudo: false,
      target: env_export_target,
      uid: config.uid
    });
  }
  // Write script
  if (config.bash) {
    command = config.command;
    if (typeof config.target !== 'string') {
      config.target = path.join(metadata.tmpdir, utils.string.hash(config.command));
    }
    log({
      message: `Writing bash script to ${JSON.stringify(config.target)}`,
      level: 'INFO'
    });
    config.command = `${config.bash} ${config.target}`;
    if (config.uid) {
      config.command = `su - ${config.uid} -c '${config.command}'`;
    }
    if (!config.dirty) {
      config.command += `;code=\`echo $?\`; rm '${config.target}'; exit $code`;
    }
    await this.fs.base.writeFile({
      content: command,
      mode: config.mode,
      sudo: false,
      target: config.target,
      uid: config.uid
    });
  }
  if (config.arch_chroot) {
    command = config.command;
    if (typeof config.target !== 'string') {
      config.target = `${metadata.tmpdir}/${utils.string.hash(config.command)}`;
    }
    log({
      message: `Writing arch-chroot script to ${JSON.stringify(config.target)}`,
      level: 'INFO'
    });
    config.command = `${config.arch_chroot} ${config.rootdir} bash ${config.target}`;
    if (!config.dirty) {
      config.command += `;code=\`echo $?\`; rm '${path.join(config.rootdir, config.target)}'; exit $code`;
    }
    await this.fs.base.writeFile({
      target: `${path.join(config.rootdir, config.target)}`,
      content: `${command}`,
      mode: config.mode,
      sudo: false
    });
  }
  if (sudo) {
    config.command = `sudo ${config.command}`;
  }
  // Execute
  return new Promise(function(resolve, reject) {
    var child, result, stderr_stream_open, stdout_stream_open;
    if (config.stdin_log) {
      log({
        message: config.command_original,
        type: 'stdin',
        level: 'INFO'
      });
    }
    result = {
      stdout: [],
      stderr: [],
      code: null,
      status: false,
      command: config.command_original
    };
    if (config.dry) {
      // env_export_hash: env_export_hash
      return resolve(result);
    }
    child = exec(config, {
      ssh: ssh,
      env: env
    });
    if (config.stdin) {
      config.stdin.pipe(child.stdin);
    }
    if (config.stdout) {
      child.stdout.pipe(config.stdout, {
        end: false
      });
    }
    if (config.stderr) {
      child.stderr.pipe(config.stderr, {
        end: false
      });
    }
    stdout_stream_open = stderr_stream_open = false;
    if (config.stdout_return || config.stdout_log) {
      child.stdout.on('data', function(data) {
        if (config.stdout_log) {
          stdout_stream_open = true;
        }
        if (config.stdout_log) {
          log({
            message: data,
            type: 'stdout_stream'
          });
        }
        if (config.stdout_return) {
          if (Array.isArray(result.stdout)) { // A string once `exit` is called
            return result.stdout.push(data);
          } else {
            return console.warn(['NIKITA_EXECUTE_STDOUT_INVALID:', 'stdout coming after child exit,', `got ${JSON.stringify(data.toString())},`, 'this is embarassing and we never found how to catch this bug,', 'we would really enjoy some help to replicate or fix this one.'].join(' '));
          }
        }
      });
    }
    if (config.stderr_return || config.stderr_log) {
      child.stderr.on('data', function(data) {
        if (config.stderr_log) {
          stderr_stream_open = true;
        }
        if (config.stderr_log) {
          log({
            message: data,
            type: 'stderr_stream'
          });
        }
        if (config.stderr_return) {
          if (Array.isArray(result.stderr)) { // A string once `exit` is called
            return result.stderr.push(data);
          } else {
            return console.warn(['NIKITA_EXECUTE_STDERR_INVALID:', 'stderr coming after child exit,', `got ${JSON.stringify(data.toString())},`, 'this is embarassing and we never found how to catch this bug,', 'we would really enjoy some help to replicate or fix this one.'].join(' '));
          }
        }
      });
    }
    return child.on("exit", function(code) {
      result.code = code;
      // Give it some time because the "exit" event is sometimes
      // called before the "stdout" "data" event when running
      // `npm test`
      return setImmediate(function() {
        if (stdout_stream_open && config.stdout_log) {
          log({
            message: null,
            type: 'stdout_stream'
          });
        }
        if (stderr_stream_open && config.stderr_log) {
          log({
            message: null,
            type: 'stderr_stream'
          });
        }
        result.stdout = result.stdout.map(function(d) {
          return d.toString();
        }).join('');
        if (config.trim || config.stdout_trim) {
          result.stdout = result.stdout.trim();
        }
        result.stderr = result.stderr.map(function(d) {
          return d.toString();
        }).join('');
        if (config.trim || config.stderr_trim) {
          result.stderr = result.stderr.trim();
        }
        // if config.format
        //   console.log '>>>', config.command_original
        //   console.log '!!!', result.stdout
        if (config.format && config.code.indexOf(code) !== -1) {
          result.data = (function() {
            switch (config.format) {
              case 'json':
                return JSON.parse(result.stdout);
              case 'yaml':
                return yaml.load(result.stdout);
            }
          })();
        }
        if (result.stdout && result.stdout !== '' && config.stdout_log) {
          log({
            message: result.stdout,
            type: 'stdout'
          });
        }
        if (result.stderr && result.stderr !== '' && config.stderr_log) {
          log({
            message: result.stderr,
            type: 'stderr'
          });
        }
        if (config.stdout) {
          child.stdout.unpipe(config.stdout);
        }
        if (config.stderr) {
          child.stderr.unpipe(config.stderr);
        }
        if (config.code.indexOf(code) === -1 && config.code_skipped.indexOf(code) === -1) {
          return reject(utils.error('NIKITA_EXECUTE_EXIT_CODE_INVALID', ['an unexpected exit code was encountered,', `command is ${JSON.stringify(utils.string.max(config.command_original, 50))},`, `got ${JSON.stringify(result.code)}`, config.code.length === 1 ? `instead of ${config.code}.` : `while expecting one of ${JSON.stringify(config.code)}.`], {
            ...result,
            exit_code: code
          }));
        }
        if (config.code_skipped.indexOf(code) === -1) {
          result.status = true;
        } else {
          log({
            message: `Skip exit code \"${code}\"`,
            level: 'INFO'
          });
        }
        return resolve(result);
      });
    });
  });
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    // tmpdir: true
    schema: schema
  }
};

// ## Dependencies
exec = require('ssh2-exec');

yaml = require('js-yaml');

utils = require('../../utils');

({merge} = require('mixme'));
