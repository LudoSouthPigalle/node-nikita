// Generated by CoffeeScript 2.5.1
var handlers, session, utils;

session = require('../session');

utils = require('../utils');

module.exports = {
  module: '@nikitajs/engine/lib/plugins/assertion',
  require: ['@nikitajs/engine/lib/metadata/raw', '@nikitajs/engine/lib/metadata/disabled'],
  hooks: {
    'nikita:session:normalize': function(action, handler) {
      var assertions, property, value;
      // Ventilate assertions properties defined at root
      assertions = {};
      for (property in action) {
        value = action[property];
        if (/^(assert)($|_[\w_]+$)/.test(property)) {
          if (assertions[property]) {
            throw Error('ASSERTION_DUPLICATED_DECLARATION', [`Property ${property} is defined multiple times,`, 'at the root of the action and inside assertions']);
          }
          if (!Array.isArray(value)) {
            value = [value];
          }
          assertions[property] = value;
          delete action[property];
        }
      }
      return async function() {
        action = (await handler.call(null, ...arguments));
        action.assertions = assertions;
        return action;
      };
    },
    'nikita:session:result': async function({action, error, output}) {
      var final_run, k, local_run, ref, v;
      final_run = true;
      ref = action.assertions;
      for (k in ref) {
        v = ref[k];
        if (handlers[k] == null) {
          continue;
        }
        local_run = (await handlers[k].call(null, action, error, output));
        if (local_run === false) {
          final_run = false;
        }
      }
      if (!final_run) {
        throw utils.error('NIKITA_INVALID_ASSERTION', ['action did not validate the assertion']);
      }
    }
  }
};

handlers = {
  assert: async function(action, error, output) {
    var assertion, final_run, i, len, ref, run;
    final_run = true;
    ref = action.assertions.assert;
    for (i = 0, len = ref.length; i < len; i++) {
      assertion = ref[i];
      if (typeof assertion === 'function') {
        assertion = (await session({
          hooks: {
            on_result: function({action}) {
              return delete action.parent;
            }
          },
          metadata: {
            condition: true,
            depth: action.metadata.depth,
            raw_output: true,
            raw_input: true
          },
          parent: action,
          handler: assertion,
          config: action.config,
          error: error,
          output: output
        }));
      }
      run = (function() {
        switch (typeof assertion) {
          case 'undefined':
            return false;
          case 'boolean':
            return condition;
          case 'number':
            return !!condition;
          case 'string':
            return !!condition.length;
          case 'object':
            if (Buffer.isBuffer(condition)) {
              return !!condition.length;
            } else if (condition === null) {
              return false;
            } else {
              return !!Object.keys(condition).length;
            }
            break;
          default:
            throw Error('Value type is not handled');
        }
      })();
      if (run === false) {
        final_run = false;
      }
    }
    return final_run;
  },
  unassert: async function(action, error, output) {
    var assertion, final_run, i, len, ref, run;
    final_run = true;
    ref = action.assertions.unless;
    for (i = 0, len = ref.length; i < len; i++) {
      assertion = ref[i];
      if (typeof assertion === 'function') {
        assertion = (await session({
          hooks: {
            on_result: function({action}) {
              return delete action.parent;
            }
          },
          metadata: {
            condition: true,
            depth: action.metadata.depth,
            raw_output: true
          },
          parent: action,
          handler: assertion,
          config: action.config
        }));
      }
      run = (function() {
        switch (typeof assertion) {
          case 'undefined':
            return true;
          case 'boolean':
            return !assertion;
          case 'number':
            return !condition;
          case 'string':
            return !assertion.length;
          case 'object':
            if (Buffer.isBuffer(assertion)) {
              return !assertion.length;
            } else if (assertion === null) {
              return true;
            } else {
              return !Object.keys(assertion).length;
            }
            break;
          default:
            throw Error('Value type is not handled');
        }
      })();
      if (run === false) {
        final_run = false;
      }
    }
    return final_run;
  }
};
