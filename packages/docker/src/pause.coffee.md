
# `nikita.docker.pause`

Pause all processes within a container.

## Output

* `err`   
  Error object if any.
* `status`   
  True if container was pulled.

## Example

```js
const {status} = await nikita.docker.pause({
  container: 'toto'
})
console.info(`Container was paused: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'container':
          type: 'string'
          description: """
          Name/ID of the container.
          """
        'docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/docker'
      required: ['container']

## Handler

    handler = ({config}) ->
      await @docker.tools.execute
        command: "pause #{config.container}"

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'docker'
        schema: schema
