// Generated by CoffeeScript 2.5.1
var utils;

utils = require('../utils');

module.exports = function(handlers) {
  var promise, scheduler, stack, state;
  stack = [];
  scheduler = null;
  state = {
    error: void 0,
    output: [],
    resolved: false,
    running: false
  };
  promise = new Promise(function(resolve, reject) {
    scheduler = {
      pump: function() {
        var item;
        if (state.running) {
          return;
        }
        if (!state.resolved) {
          if (state.error) {
            state.resolved = true;
            return reject(state.error);
          } else if (!stack.length) {
            state.resolved = true;
            return resolve(state.output);
          }
        }
        if (!stack.length) {
          return;
        }
        state.running = true;
        item = stack.shift();
        item = item;
        return setImmediate(async function() {
          var error, result;
          try {
            result = (await item.handler.call());
            state.running = false;
            item.resolve.call(null, result);
            if (item.options.output) {
              state.output.push(result);
            }
            return setImmediate(function() {
              return scheduler.pump();
            });
          } catch (error1) {
            error = error1;
            state.running = false;
            item.reject.call(null, error);
            if (stack.length !== 0) {
              state.error = error;
            }
            return setImmediate(function() {
              return scheduler.pump();
            });
          }
        });
      },
      unshift: function(handlers, options = {}) {
        var isArray;
        if (options.pump == null) {
          options.pump = true;
        }
        isArray = Array.isArray(handlers);
        if (!(isArray || typeof handlers === 'function')) {
          throw Error('Invalid Argument');
        }
        return new Promise(function(resolve, reject) {
          var handler;
          if (!isArray) {
            stack.unshift({
              handler: handlers,
              resolve: resolve,
              reject: reject,
              options: options
            });
            return scheduler.pump();
          } else {
            // Unshift from the last to the first element to preserve order
            return Promise.all(((function() {
              var i, len, ref, results;
              ref = handlers.reverse();
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                handler = ref[i];
                results.push(scheduler.unshift(handler, {
                  pump: false
                }));
              }
              return results;
            })()).reverse()).then(resolve, reject);
          }
        });
      },
      push: function(handlers, options = {}) {
        var isArray, prom;
        isArray = Array.isArray(handlers);
        if (!(isArray || typeof handlers === 'function')) {
          throw Error('Invalid Argument');
        }
        prom = new Promise(function(resolve, reject) {
          var handler;
          if (!isArray) {
            stack.push({
              handler: handlers,
              resolve: resolve,
              reject: reject,
              options: options
            });
            return scheduler.pump();
          } else {
            return Promise.all((function() {
              var i, len, results;
              results = [];
              for (i = 0, len = handlers.length; i < len; i++) {
                handler = handlers[i];
                results.push(scheduler.push(handler, options));
              }
              return results;
            })()).then(resolve, reject);
          }
        });
        prom.catch((function() {})); // Handle strict unhandled rejections
        return prom;
      }
    };
    if (handlers) {
      return scheduler.push(handlers, {
        output: true
      });
    }
  });
  promise.catch((function() {})); // Handle strict unhandled rejections
  return new Proxy(promise, {
    get: function(target, name) {
      if (target[name] != null) {
        if (typeof target[name] === 'function') {
          return target[name].bind(target);
        } else {
          return target[name];
        }
      } else {
        return scheduler[name];
      }
    }
  });
};
