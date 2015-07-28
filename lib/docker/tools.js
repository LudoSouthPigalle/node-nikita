// Generated by CoffeeScript 1.9.1
var mecano;

mecano = require('..');

module.exports = {
  get_provider: function(options, callback) {
    return mecano.execute({
      ssh: options.ssh,
      cmd: 'docker-machine -v',
      code_skipped: 127
    }, function(err, executed) {
      if (err) {
        return callback(err, null);
      }
      if (executed) {
        if (typeof options.log === "function") {
          options.log("provider is: docker-machine [DEBUG]");
        }
        return callback(null, 'docker-machine');
      }
      return mecano.execute({
        ssh: options.ssh,
        cmd: 'boot2docker -v',
        code_skipped: 127
      }, function(err, executed) {
        var provider;
        if (err) {
          return callback(err, null);
        }
        provider = executed ? 'boot2docker' : 'docker';
        if (typeof options.log === "function") {
          options.log("provider is: " + provider + " [DEBUG]");
        }
        return callback(null, provider);
      });
    });
  },
  prepare_cmd: function(provider, machine) {
    if (provider == null) {
      return Error('Missing provider parameter');
    }
    if (provider === 'docker') {
      return '';
    }
    if (machine == null) {
      return Error('Missing `machine` option name. Need the name of the docker-machine');
    }
    if (provider === 'docker-machine') {
      return "eval \"$(docker-machine env " + machine + ")\" && ";
    } else if (provider === 'boot2docker') {
      return '$(boot2docker shellinit) && ';
    } else {
      return callback(Error("Unknown docker provider: " + provider));
    }
  }
};