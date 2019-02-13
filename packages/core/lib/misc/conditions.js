// Generated by CoffeeScript 2.3.2
// # Conditions

// Conditions are a set of properties you may add to the options of the Nikita
// functions. They apply to all functions and control their execution.

// A Nikita action will be executed if all the positive conditions are "true" and
// none of the negative conditions are "true".
var each, exec, fs, os, semver, template;

module.exports = {
  // ## Run an action for a user defined condition: `if`

  // Condition the execution of an action to a user defined condition interpreted as
  // `true`. It is available as the `unless` of `options`.

  // When `if` is a boolean, a string, a number or null, its value determine the
  // output.

  // If it's a function, the arguments vary depending on the callback signature. With
  // 1 argument, the argument is an context object including the `options` object and
  // the handler is run synchronously. With 2 arguments, the arguments are an options
  // object plus a callback and the handler is run asynchronously.

  // If it's an array, all its element must positively resolve for the condition to
  // pass.

  // Updating the content of a file if we are the owner

  // ```js
  // nikita.file.render({
  //   source:'./file',
  //   if: function({options}, callback){
  //     fs.stat(options.source, function(err, stats){
  //       # Render the file if we own it
  //       callback(err, stats.uid == process.getuid())
  //     });
  //   }
  // }, fonction(err, rendered){});
  // ```
  if: function({options}, succeed, skip) {
    var ok;
    if (!Array.isArray(options.if)) {
      options.if = [options.if];
    }
    ok = true;
    return each(options.if).call((si, next) => {
      var err, type;
      if (!ok) {
        return next();
      }
      type = typeof si;
      if (si === null || type === 'undefined') {
        ok = false;
        return next();
      } else if (type === 'boolean' || type === 'number') {
        if (!si) {
          ok = false;
        }
        return next();
      } else if (type === 'function') {
        if (si.length < 2) {
          try {
            if (!si.call(this, {
              options: options
            })) {
              ok = false;
            }
            return next();
          } catch (error) {
            err = error;
            return next(err);
          }
        } else if (si.length === 2) {
          try {
            return si.call(this, {
              options: options
            }, (err, is_ok) => {
              if (err) {
                return next(err);
              }
              if (!is_ok) {
                ok = false;
              }
              return next();
            });
          } catch (error) {
            err = error;
            return next(err);
          }
        } else {
          return next(Error(`Invalid argument length, expecting 2 or less, got ${si.length}`));
        }
      } else if (type === 'string' || (type === 'object' && Buffer.isBuffer(si))) {
        si = template(si.toString(), {
          options: options
        });
        if (si.length === 0) {
          ok = false;
        }
        return next();
      } else {
        return next(Error(`Invalid condition "if": ${JSON.stringify(si)}`));
      }
    }).next(function(err) {
      if (err || !ok) {
        return skip(err);
      } else {
        return succeed();
      }
    });
  },
  // ## Run an action if false: `unless`

  // Condition the execution of an action to a user defined condition interpreted as
  // `false`. It is available as the `unless` of `options`.

  // When `if` is a boolean, a string, a number or null, its value determine the
  // output.

  // If it's a function, the arguments vary depending on the callback signature. With
  // 1 argument, the argument is an context object including the `options` object and
  // the handler is run synchronously. With 2 arguments, the arguments are an options
  // object plus a callback and the handler is run asynchronously.

  // If it's an array, all its element must negatively resolve for the condition to
  // pass.
  unless: function({options}, succeed, skip) {
    var ok;
    if (!Array.isArray(options.unless)) {
      options.unless = [options.unless];
    }
    ok = true;
    return each(options.unless).call((not_if, next) => {
      var err, type;
      if (!ok) {
        return next();
      }
      type = typeof not_if;
      if (not_if === null || type === 'undefined') {
        ok = true;
        return next();
      } else if (type === 'boolean' || type === 'number') {
        if (not_if) {
          ok = false;
        }
        return next();
      } else if (type === 'function') {
        if (not_if.length < 2) {
          try {
            if (not_if.call(this, {
              options: options
            })) {
              ok = false;
            }
            return next();
          } catch (error) {
            err = error;
            return next(err);
          }
        } else if (not_if.length === 2) {
          try {
            return not_if.call(this, {
              options: options
            }, (err, is_ok) => {
              if (err) {
                return next(err);
              }
              if (is_ok) {
                ok = false;
              }
              return next();
            });
          } catch (error) {
            err = error;
            return next(err);
          }
        } else {
          return next(Error("Invalid callback"));
        }
      } else if (type === 'string' || (type === 'object' && Buffer.isBuffer(not_if))) {
        not_if = template(not_if.toString(), {
          options: options
        });
        if (not_if.length !== 0) {
          ok = false;
        }
        return next();
      } else {
        return next(Error(`Invalid condition "unless": ${JSON.stringify(not_if)}`));
      }
    }).next(function(err) {
      if (err || !ok) {
        return skip(err);
      } else {
        return succeed();
      }
    });
  },
  // ## Run an action if a command succeed: `if_exec`

  // Work on the property `if_exec` in `options`. The value may 
  // be a single shell command or an array of commands.   

  // The callback `succeed` is called if all the provided command 
  // were executed successfully otherwise the callback `skip` is called.
  if_exec: function({options}, succeed, skip) {
    return each(options.if_exec).call((cmd, next) => {
      this.log({
        message: `Nikita \`if_exec\`: ${cmd}`,
        level: 'DEBUG',
        module: 'nikita/misc/conditions'
      });
      return this.system.execute({
        cmd: cmd,
        relax: true,
        stderr_log: false,
        stdin_log: false,
        stdout_log: false
      }, function(err, {code}) {
        this.log({
          message: `Nikita \`if_exec\`: code is "${code}"`,
          level: 'INFO',
          module: 'nikita/misc/conditions'
        });
        if (code === 0) {
          return next();
        } else {
          return skip();
        }
      });
    }).next(succeed);
  },
  // ## Run an action unless a command succeed: `unless_exec`

  // Work on the property `unless_exec` in `options`. The value may 
  // be a single shell command or an array of commands.   

  // The callback `succeed` is called if all the provided command 
  // were executed with failure otherwise the callback `skip` is called.
  unless_exec: function({options}, succeed, skip) {
    return each(options.unless_exec).call((cmd, next) => {
      this.log({
        message: `Nikita \`unless_exec\`: ${cmd}`,
        level: 'DEBUG',
        module: 'nikita/misc/conditions'
      });
      return this.system.execute({
        cmd: cmd,
        relax: true,
        stderr_log: false,
        stdin_log: false,
        stdout_log: false
      }, function(err, {code}) {
        this.log({
          message: `Nikita \`unless_exec\`: code is "${code}"`,
          level: 'INFO',
          module: 'nikita/misc/conditions'
        });
        if (code === 0) {
          return skip();
        } else {
          return next();
        }
      });
    }).next(succeed);
  },
  // ## Run an action if OS match: `if_os`

  // Work on the property `if_os` in `options`. The value may 
  // be a single condition command or an array of conditions.   

  // The callback `succeed` is called if any of the provided filter passed otherwise
  // the callback `skip` is called.
  if_os: function({options}, succeed, skip) {
    var j, len, ref, rule, ssh;
    ssh = this.ssh(options.ssh);
    if (!Array.isArray(options.if_os)) {
      options.if_os = [options.if_os];
    }
    ref = options.if_os;
    for (j = 0, len = ref.length; j < len; j++) {
      rule = ref[j];
      if (rule.name == null) {
        rule.name = [];
      }
      if (!Array.isArray(rule.name)) {
        rule.name = [rule.name];
      }
      if (rule.version == null) {
        rule.version = [];
      }
      if (!Array.isArray(rule.version)) {
        rule.version = [rule.version];
      }
      rule.version = semver.sanitize(rule.version, 'x');
      if (rule.arch == null) {
        rule.arch = [];
      }
      if (!Array.isArray(rule.arch)) {
        rule.arch = [rule.arch];
      }
    }
    this.log({
      message: `Nikita \`if_os\`: ${JSON.stringify(options.if_os)}`,
      level: 'DEBUG',
      module: 'nikita/misc/conditions'
    });
    return exec(ssh, os, function(err, stdout, stderr) {
      var arch, match, name, version;
      if (err) {
        return skip(err);
      }
      [arch, name, version] = stdout.split('|');
      if (name.toLowerCase() === 'red hat') {
        name = 'redhat';
      }
      if (match = /^(\d+)\.(\d+)/.exec(version)) {
        // Remove minor version (eg centos 7)
        version = `${match[0]}`;
      }
      match = options.if_os.some(function(rule) {
        var n, v;
        n = !rule.name.length || rule.name.some(function(value) {
          if (typeof value === 'string' && value === name) {
            return true;
          }
          if (value instanceof RegExp && value.test(name)) {
            return true;
          }
        });
        v = !rule.version.length || rule.version.some(function(value) {
          version = semver.sanitize(version, '0');
          if (typeof value === 'string' && semver.satisfies(version, value)) {
            return true;
          }
          if (value instanceof RegExp && value.test(version)) {
            return true;
          }
        });
        return n && v;
      });
      if (match) {
        return succeed();
      } else {
        return skip();
      }
    });
  },
  // ## Run an action unless OS match: `unless_os`

  // Work on the property `unless_os` in `options`. The value may 
  // be a single condition command or an array of conditions.   

  // The callback `succeed` is called if none of the provided filter passed otherwise
  // the callback `skip` is called.
  unless_os: function({options}, succeed, skip) {
    var j, len, ref, rule, ssh;
    // SSH connection
    ssh = this.ssh(options.ssh);
    if (!Array.isArray(options.unless_os)) {
      options.unless_os = [options.unless_os];
    }
    ref = options.unless_os;
    for (j = 0, len = ref.length; j < len; j++) {
      rule = ref[j];
      if (rule.name == null) {
        rule.name = [];
      }
      if (!Array.isArray(rule.name)) {
        rule.name = [rule.name];
      }
      if (rule.version == null) {
        rule.version = [];
      }
      if (!Array.isArray(rule.version)) {
        rule.version = [rule.version];
      }
      rule.version = semver.sanitize(rule.version, 'x');
      if (rule.arch == null) {
        rule.arch = [];
      }
      if (!Array.isArray(rule.arch)) {
        rule.arch = [rule.arch];
      }
    }
    this.log({
      message: `Nikita \`unless_os\`: ${JSON.stringify(options.unless_os)}`,
      level: 'DEBUG',
      module: 'nikita/misc/conditions'
    });
    return exec(ssh, os, function(err, stdout, stderr) {
      var arch, match, name, version;
      if (err) {
        return skip(err);
      }
      [arch, name, version] = stdout.split('|');
      if (name.toLowerCase() === 'red hat') {
        name = 'redhat';
      }
      if (match = /^(\d+)\.(\d+)/.exec(version)) {
        // Remove minor version (eg centos 7)
        version = `${match[0]}`;
      }
      match = options.unless_os.some(function(rule) {
        var n, v;
        n = !rule.name.length || rule.name.some(function(value) {
          if (typeof value === 'string' && value === name) {
            return true;
          }
          if (value instanceof RegExp && value.test(name)) {
            return true;
          }
        });
        v = !rule.version.length || rule.version.some(function(value) {
          version = semver.sanitize(version, '0');
          if (typeof value === 'string' && semver.satisfies(version, value)) {
            return true;
          }
          if (value instanceof RegExp && value.test(version)) {
            return true;
          }
        });
        return n && v;
      });
      if (match) {
        return skip();
      } else {
        return succeed();
      }
    });
  },
  // ## Run an action if a file exists: `if_exists`

  // Work on the property `if_exists` in `options`. The value may 
  // be a file path or an array of file paths. You could also set the
  // value to `true`, in which case it will be set with the `target`
  // option.

  // The callback `succeed` is called if all the provided paths 
  // exists otherwise the callback `skip` is called.
  if_exists: function({options}, succeed, skip) {
    // Default to `options.target` if "true"
    if (typeof options.if_exists === 'boolean' && options.target) {
      options.if_exists = options.if_exists ? [options.target] : null;
    }
    return each(options.if_exists).call((if_exists, next) => {
      return this.fs.exists({
        target: if_exists
      }, (err, {exists}) => {
        if (exists) {
          this.log({
            message: `File exists ${if_exists}, continuing`,
            level: 'DEBUG',
            module: 'nikita/misc/conditions'
          });
          return next();
        } else {
          this.log({
            message: `File doesnt exists ${if_exists}, skipping`,
            level: 'INFO',
            module: 'nikita/misc/conditions'
          });
          return skip();
        }
      });
    }).next(succeed);
  },
  // ## Skip an action if a file exists: `unless_exists`

  // Work on the property `unless_exists` in `options`. The value may 
  // be a file path or an array of file paths. You could also set the
  // value to `true`, in which case it will be set with the `target`
  // option.

  // The callback `succeed` is called if none of the provided paths 
  // exists otherwise the callback `skip` is called.
  unless_exists: function({options}, succeed, skip) {
    // Default to `options.target` if "true"
    if (typeof options.unless_exists === 'boolean' && options.target) {
      options.unless_exists = options.unless_exists ? [options.target] : null;
    }
    return each(options.unless_exists).call((unless_exists, next) => {
      return this.fs.exists({
        target: unless_exists
      }, (err, {exists}) => {
        if (exists) {
          this.log({
            message: `File exists ${unless_exists}, skipping`,
            level: 'INFO',
            module: 'nikita/misc/conditions'
          });
          return skip();
        } else {
          this.log({
            message: `File doesnt exists ${unless_exists}, continuing`,
            level: 'DEBUG',
            module: 'nikita/misc/conditions'
          });
          return next();
        }
      });
    }).next(succeed);
  },
  // ## Ensure a file exist: `should_exist`

  // Ensure that an action run if all the files present in the 
  // option "should_exist" exist. The value may 
  // be a file path or an array of file paths.

  // The callback `succeed` is called if all of the provided paths 
  // exists otherwise the callback `skip` is called with an error.
  should_exist: function({options}, succeed, skip) {
    var ssh;
    // SSH connection
    ssh = this.ssh(options.ssh);
    return each(options.should_exist).call(function(should_exist, next) {
      return fs.exists(ssh, should_exist, function(err, exists) {
        if (exists) {
          return next();
        } else {
          return next(Error(`File does not exist: ${should_exist}`));
        }
      });
    }).error(skip).next(succeed);
  },
  // ## Ensure a file already exist: `should_not_exist`

  // Ensure that an action run if none of the files present in the 
  // option "should_exist" exist. The value may 
  // be a file path or an array of file paths.

  // The callback `succeed` is called if none of the provided paths 
  // exists otherwise the callback `skip` is called with an error.
  should_not_exist: function({options}, succeed, skip) {
    var ssh;
    // SSH connection
    ssh = this.ssh(options.ssh);
    return each(options.should_not_exist).call(function(should_not_exist, next) {
      return fs.exists(ssh, should_not_exist, function(err, exists) {
        if (exists) {
          return next(Error(`File does not exist: ${should_not_exist}`));
        } else {
          return next();
        }
      });
    }).error(skip).next(function() {
      return succeed();
    });
  },
  // ## Run all conditions: `all(options, skip, succeed)`

  // This is the function run internally to execute all the conditions.

  // *   `opts`
  //     Command options
  // *   `succeed`
  //     Succeed callback, only called if all the condition succeed
  // *   `skip`
  //     Skip callback, called when a condition is not fulfill. May also be called with on error on failure

  // Example:

  // ```js
  // conditions.all({
  //   if: true
  // }, function(){
  //   console.info('Conditions succeed')
  // }, function(err){
  //   console.info('Conditins failed or pass an error')
  // })
  // ```
  all: function(session, {options}, succeed, failed) {
    var i, keys, next;
    if (!((options != null) && (typeof options === 'object' && !Array.isArray(options)))) {
      return succeed();
    }
    keys = Object.keys(options);
    i = 0;
    next = function() {
      var key;
      key = keys[i++];
      if (key == null) {
        return succeed();
      }
      if (key === 'all') {
        return next();
      }
      if (module.exports[key] == null) {
        return next();
      }
      return module.exports[key].call(session, {
        options: options
      }, next, function(err) {
        return failed(err);
      });
    };
    next();
    return null;
  }
};

// ## Dependencies
each = require('each');

exec = require('ssh2-exec');

fs = require('ssh2-fs');

os = require('./os');

semver = require('./semver');

template = require('./template');
