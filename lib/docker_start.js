// Generated by CoffeeScript 1.9.1
var docker;

module.exports = function(options, callback) {
  if (options.container == null) {
    return callback(Error('Missing container parameter'));
  }
  return docker.get_provider(options, (function(_this) {
    return function(err, provider) {
      var cmd, exec_opts, i, k, len, ref;
      if (err) {
        return callback(err);
      }
      options.provider = provider;
      cmd = docker.prepare_cmd(provider, options.machine);
      cmd += 'docker start ';
      if (options.attach) {
        cmd += '-a ';
      }
      exec_opts = cmd += options.container({
        cmd: cmd
      });
      ref = ['ssh', 'log', 'stdout', 'stderr', 'cwd', 'code', 'code_skipped'];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        if (options[k] != null) {
          exec_opts[k] = options[k];
        }
      }
      return _this.execute(exec_opts, function(err, executed, stdout, stderr) {
        return callback(err, executed, stdout, stderr);
      });
    };
  })(this));
};

docker = require('./misc/docker');