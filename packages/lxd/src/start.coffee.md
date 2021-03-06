
# `nikita.lxd.start`

Start containers.

## Output

* `err`
  Error object if any.
* `info.status`
  Was the container started or already running.

## Example

```js
const {status} = await nikita.lxd.start({
  container: "my_container"
})
console.info(`Container was started: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'container':
          $ref: 'module://@nikitajs/lxd/src/init#/properties/container'
      required: ['container']

## Handler

    handler = ({config}) ->
      command_init = [
        'lxc', 'start', config.container
      ].join ' '
      # Execution
      await @execute
        command: """
        lxc list -c ns --format csv | grep '#{config.container},RUNNING' && exit 42
        #{command_init}
        """
        code_skipped: 42

## Export

    module.exports =
      handler: handler
      metadata:
        schema: schema
