
# `nikita.docker.inspect`

Send signal to containers using SIGKILL or a specified signal.
Note if container is not running , SIGKILL is not executed and
return status is UNMODIFIED. If container does not exist nor is running
SIGNAL is not sent.

## Output

* `err`   
  Error object if any.
* `status`   
  True if container was killed.

## Example

Inspect a single container.

```js
const {info} = await nikita.docker.inspect({
  name: 'my_container'
})
console.info(`Container id is ${info.Id}`)
```

Inspect multiple containers.

```js
const {info} = await nikita.docker.inspect({
  name: 'my_container'
})
info.map( (container) =>
  console.info(`Container id is ${container.Id}`)
)
```

## Schema

    schema =
      type: 'object'
      properties:
        'container':
          oneOf: [
            type: 'string'
          ,
            type: 'array'
            items: type: 'string'
          ]
          description: """
          Name/ID of the container (array of containers not yet implemented).
          """
        'docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/docker'
      required: ['container']

## Handler

    handler = ({config}) ->
      isCointainerArray = Array.isArray config.container
      {data: info} = await @docker.tools.execute
        command: [
          'inspect'
          ...(
            if isCointainerArray then config.container else [config.container]
          )
        ].join ' '
        format: 'json'
      info: if isCointainerArray then info else info[0]

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'docker'
        schema: schema
