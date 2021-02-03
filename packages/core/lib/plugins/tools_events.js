// Generated by CoffeeScript 2.5.1
var EventEmitter;

({EventEmitter} = require('events'));

module.exports = {
  name: '@nikitajs/core/lib/plugins/tools_events',
  hooks: {
    'nikita:session:normalize': function(action, handler) {
      return async function() {
        // Handler execution
        action = (await handler.apply(null, arguments));
        // Register function
        if (action.tools == null) {
          action.tools = {};
        }
        action.tools.events = action.parent ? action.parent.tools.events : action.tools.events = new EventEmitter();
        return action;
      };
    },
    'nikita:session:action': function(action) {
      return action.tools.events.emit('nikita:action:start', action);
    },
    'nikita:session:result': {
      after: '@nikitajs/core/lib/metadata/status',
      handler: function({action, error, output}, handler) {
        return async function({action}) {
          var err;
          try {
            output = (await handler.apply(null, arguments));
            action.tools.events.emit('nikita:action:end', action, null, output);
            return output;
          } catch (error1) {
            err = error1;
            action.tools.events.emit('nikita:action:end', action, err, output);
            throw err;
          }
        };
      }
    },
    'nikita:session:resolved': function({action}) {
      return action.tools.events.emit('nikita:session:resolved', ...arguments);
    },
    'nikita:session:rejected': function({action}) {
      return action.tools.events.emit('nikita:session:rejected', ...arguments);
    }
  }
};