
# `nikita.fs.base.createWriteStream`

## Example

```js
const {status} = await nikita.fs.base.createWriteStream({
  target: '/path/to/file'
  stream: function(ws){
    ws.write('some content')
    ws.end()
  }
})
console.info(`Stream was created: ${status}`)
```

## Hooks

    on_action =
      before: '@nikitajs/core/src/metadata/tmpdir'
      handler: ({config, metadata, tools: {find}}) ->
        sudo = await find ({config: {sudo}}) -> sudo
        config.target = metadata.argument if metadata.argument?
        if sudo or config.flags?[0] is 'a'
          metadata.tmpdir = true

## Schema

    schema =
      type: 'object'
      properties:
        'flags':
          type: 'string'
          default: 'w'
          description: """
          File system flag as defined in the [Node.js
          documentation](https://nodejs.org/api/fs.html#fs_file_system_flags)
          and [open(2)](http://man7.org/linux/man-pages/man2/open.2.html)
          """
        'target_tmp':
          type: 'string'
          description: """
          Location where to write the temporary uploaded file before it is
          copied into its final destination, default to
          "{tmpdir}/nikita_{YYMMDD}_{pid}_{rand}/{hash target}"
          """
        'mode':
          oneOf: [{type: 'integer'}, {type: 'string'}]
          default: 0o644
          description: """
          Permission mode, a bit-field describing the file type and mode.
          """
        'stream':
          typeof: 'function'
          description: """
          User provided function receiving the newly created writable stream.
          The user is responsible for writing new content and for closing the
          stream.
          """
        'target':
          oneOf: [{type: 'string'}, {instanceof: 'Buffer'}]
          description: """
          Final destination path.
          """
      required: ['target', 'stream']

## Handler

    handler = ({config, metadata, tools: {find, log}, ssh}) ->
      sudo = await find ({config: {sudo}}) -> sudo
      # Normalize config
      if sudo or config.flags[0] is 'a'
        config.target_tmp ?= "#{metadata.tmpdir}/#{utils.string.hash config.target}"
      # config.mode ?= 0o644 # Node.js default to 0o666
      # In append mode, we write to a copy of the target file located in a temporary location
      try if config.flags[0] is 'a'
        await @execute """
        [ ! -f '#{config.target}' ] && exit
        cp '#{config.target}' '#{config.target_tmp}'
        """
        log message: "Append prepared by placing a copy of the original file in a temporary path", level: 'INFO'
      catch err
        log message: "Failed to place original file in temporary path", level: 'ERROR'
        throw err
      # Start writing the content
      log message: 'Writting file', level: 'DEBUG'
      await new Promise (resolve, reject) ->
        ws = await fs.createWriteStream ssh, config.target_tmp or config.target,
          flags: config.flags,
          mode: config.mode
        config.stream ws
        err = false # Quick fix ws sending both the error and close events on error
        ws.on 'error', (err) ->
          if err.code is 'ENOENT'
            err = errors.NIKITA_FS_CWS_TARGET_ENOENT config: config
          reject err
        ws.on 'end', ->
          ws.destroy()
        ws.on 'close', ->
          resolve() unless err
      # Replace the target file in append or sudo mode
      if config.target_tmp
        await @execute
          command: """
          mv '#{config.target_tmp}' '#{config.target}'
          """

## Exports

    module.exports =
      handler: handler
      metadata:
        log: false
        raw_output: true
        schema: schema
      hooks:
        on_action: on_action

## Errors

    errors =
      NIKITA_FS_CWS_TARGET_ENOENT: ({config}) ->
        utils.error 'NIKITA_FS_CWS_TARGET_ENOENT', [
          'fail to write a file,'
          unless config.target_tmp
          then "location is #{JSON.stringify config.target}."
          else "location is #{JSON.stringify config.target_tmp} (temporary file, target is #{JSON.stringify config.target})."
        ],
          errno: -2
          path: config.target_tmp or config.target # Native Node.js api doesn't provide path
          syscall: 'open'

## Dependencies

    fs = require 'ssh2-fs'
    utils = require '../../../utils'
