
# `nikita.fs.link`

Create a symbolic link and it's parent directories if they don't yet
exist.

Note, it is valid for the "source" file to not exist.

## Output

* `err`   
  Error object if any.   
* `status`   
  Value is "true" if link was created or modified.   

## Example

```js
const {status} = await nikita.fs.link({
  source: __dirname,
  target: '/tmp/a_link'
})
console.info(`Link was created: ${status}`)
```

## Hook

    on_action = ({config}) ->
      throw Error "Missing source, got #{JSON.stringify(config.source)}" unless config.source
      throw Error "Missing target, got #{JSON.stringify(config.target)}" unless config.target

## Schema

    schema =
      type: 'object'
      properties:
        'source':
          type: 'string'
          description: """
          Referenced file to be linked.
          """
        'target':
          type: 'string'
          description: """
          Symbolic link to be created.
          """
        'exec':
          type: 'boolean'
          description: """
          Create an executable file with an `exec` command.
          """
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          default: 0o755
          description: """
          Directory mode. Modes may be absolute or symbolic. An absolute mode is
          an octal number. A symbolic mode is a string with a particular syntax
          describing `who`, `op` and `perm` symbols.
          """
      required: ['source', 'target']

## Handler

    handler = ({config, tools: {path}}) ->
      # Set default
      config.mode ?= 0o0755
      # It is possible to have collision if two symlink
      # have the same parent directory
      await @fs.base.mkdir
        target: path.dirname config.target
        metadata: relax: 'EEXIST'
      if config.exec
        exists = await @call metadata: raw_output: true, ->
          {exists} = await @fs.base.exists target: config.target
          return false unless exists
          {data} = await @fs.base.readFile
            target: config.target
            encoding: 'utf8'
          exec_command = /exec (.*) \$@/.exec(data)[1]
          exec_command and exec_command is config.source
        return if exists
        content = """
        #!/bin/bash
        exec #{config.source} $@
        """
        await @fs.base.writeFile
          target: config.target
          content: content
        await @fs.base.chmod
          target: config.target
          mode: config.mode
      else
        exists = await @call metadata: raw_output: true, ->
          try
            {target} = await @fs.base.readlink target: config.target
            return true if target is config.source
            await @fs.base.unlink target: config.target
            false
          catch err
            false
        return if exists
        await @fs.base.symlink
          source: config.source
          target: config.target
      true

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        schema: schema
