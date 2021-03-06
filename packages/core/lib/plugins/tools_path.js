// Generated by CoffeeScript 2.5.1
var os, path;

os = require('os');

path = require('path');

module.exports = {
  name: '@nikitajs/core/lib/plugins/tools_path',
  // require: '@nikitajs/core/lib/metadata/ssh'
  hooks: {
    'nikita:session:action': {
      // after: '@nikitajs/core/lib/metadata/ssh'
      handler: function(action) {
        if (action.tools == null) {
          action.tools = {};
        }
        // Path is alwaws posix over ssh
        // otherwise it is platform dependent
        action.tools.path = !action.ssh ? os.platform === 'win32' ? path.win32 : path.posix : path.posix;
        // Reinject posix and win32 path for conveniency
        action.tools.path.posix = path.posix;
        return action.tools.path.win32 = path.win32;
      }
    }
  }
};
