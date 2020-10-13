
`nikita.file.types.locale_gen`

Update the locale definition file located in "/etc/locale.gen".

## Example

```javascript
require('nikita')
.file.types.locale_gen({
  target: '/etc/locale.gen',
  rootdir: '/mnt',
  locales: ['fr_FR.UTF-8', 'en_US.UTF-8']
})
```

## Schema

    schema =
      type: 'object'
      properties:
        'rootdir':
          type: 'string'
          description: """
          Path to the mount point corresponding to the root directory, optional.
          """
        'generate':
          type: 'boolean', default: null
          description: """
          Run `locale-gen` by default if target was modified or force running
          the command if value is a boolean.
          """
        'locales':
          type: 'array'
          items:
            type: 'string'
          description: """
          List of supported locales, required.
          """
        'target':
          type: 'string', default: '/etc/locale.gen'
          description: """
          File to write, default to "/etc/locale.gen".
          """
      required: ['locales']

## Handler

    handler = ({config}) ->
      # log message: "Entering file.types.local_gen", level: 'DEBUG', module: 'nikita/lib/file/types/local_gen'
      config.target = "#{path.join config.rootdir, config.target}" if config.rootdir
      # Write configuration
      {data} = await @fs.base.readFile
        target: config.target
        encoding: 'ascii'
      status = false
      locales = data.split '\n'
      for locale, i in locales
        if match = /^#([\w_\-\.]+)($| .+$)/.exec locale
          if match[1] in config.locales
            locales[i] = match[1]+match[2]
            status = true
        if match = /^([\w_\-\.]+)($| .+$)/.exec locale
          if match[1] not in config.locales
            locales[i] = '#'+match[1]+match[2]
            status = true
      if status
        data = locales.join '\n'
        res = await @fs.base.writeFile
          target: config.target
          content: data
      # Reload configuration
      @execute
        if:
          if config.generate?
          then config.generate
          else status
        rootdir: config.rootdir
        cmd: "locale-gen"
      status: status || config.generate

## Exports

    module.exports =
      handler: handler
      schema: schema

## Dependencies

    path = require 'path'