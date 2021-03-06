// Generated by CoffeeScript 2.5.1
// # `nikita.docker.wait`

// Block until a container stops.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   True unless container was already stopped.

// ## Example

// ```js
// const {status} = await nikita.docker.wait({
//   container: 'toto'
// })
// console.info(`Did we really had to wait: ${status}`)
// ```

// ## Schema
var handler, schema;

schema = {
  type: 'object',
  properties: {
    'container': {
      type: 'string',
      description: `Name/ID of the container.`
    },
    'docker': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/docker'
    }
  },
  required: ['container']
};

// ## Handler
handler = async function({config}) {
  // Old implementation was `wait {container} | read r; return $r`
  return (await this.docker.tools.execute(`wait ${config.container}`));
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker',
    schema: schema
  }
};
