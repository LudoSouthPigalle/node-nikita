
# `nikita.docker.unpause`

Unpause all processes within a container.

## Output

* `err`   
  Error object if any.
* `status`   
  True if container was unpaused.

## Example

```js
const {status} = await nikita.docker.unpause({
  container: 'toto'
})
console.info(`Container was unpaused: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'boot2docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
        'container':
          type: 'string'
          description: """
          Name/ID of the container
          """
        'docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/docker'
      required: ['container']

## Handler

    handler = ({config, tools: {log}}) ->
      # Validation
      throw Error 'Missing container parameter' unless config.container?
      await @docker.tools.execute
        command: "unpause #{config.container}"

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'docker'
        schema: schema
