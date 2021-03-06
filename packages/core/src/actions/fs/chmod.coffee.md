
# `nikita.fs.chmod`

Change the permissions of a file or directory.

## Output

* `err`   
  Error object if any.   
* `status`   
  Value is "true" if file permissions was created or modified.   

## Example

```js
const {status} = await nikita.fs.chmod({
  target: '~/my/project',
  mode: 0o755
})
console.info(`Permissions was modified: ${status}`)
```

## Hook

    on_action = ({config, metadata}) ->
      config.target = metadata.argument if metadata.argument?

## Schema

    schema =
      type: 'object'
      properties:
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          # default: 0o644
          description: """
          File mode. Modes may be absolute or symbolic. An absolute mode is
          an octal number. A symbolic mode is a string with a particular syntax
          describing `who`, `op` and `perm` symbols.
          """
        'stats':
          typeof: 'object'
          description: """
          Stat object of the target file. Short-circuit to avoid fetching the
          stat object associated with the target if one is already available.
          """
        'target':
          type: 'string'
          description: """
          Location of the file which permission will change.
          """
      required: ['mode']

## Handler

    handler = ({config, tools: {log}}) ->
      if config.stats
      then stats = config.stats
      else {stats} = await @fs.base.stat config.target
      # Detect changes
      if utils.mode.compare stats.mode, config.mode
        log message: "Identical permissions \"#{config.mode.toString 8}\" on \"#{config.target}\"", level: 'INFO'
        return false
      # Apply changes
      await @fs.base.chmod target: config.target, mode: config.mode
      log message: "Permissions changed from \"#{stats.mode.toString 8}\" to \"#{config.mode.toString 8}\" on \"#{config.target}\"", level: 'WARN'
      true

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        schema: schema

## Dependencies

    utils = require '../../utils'
