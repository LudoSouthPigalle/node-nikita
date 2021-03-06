
# `nikita.tools.npm.uninstall`

Remove one or more NodeJS packages.

## Example

The following action uninstalls the coffescript package globally.

```js
const {status} = await nikita.tools.npm.uninstall({
  name: 'coffeescript',
  global: true
})
console.info(`Package was uninstalled: ${status}`)
```

## Hooks

    on_action = ({config, metadata}) ->
      config.name = metadata.argument if typeof metadata.argument is 'string'
      config.name = [config.name] if typeof config.name is 'string'
      
## Schema

    schema =
      type: 'object'
      properties:
        'cwd':
          $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/cwd'
        'name':
          type: 'array', items: type: 'string'
          description: """
          Name of the package(s) to remove.
          """
        'global':
          type: 'boolean'
          default: false
          description: """
          Uninstalls the current package context as a global package.
          """
      required: ['name']
      if: properties: 'global': const: false
      then: required: ['cwd']

## Handler

    handler = ({config, tools: {log}}) ->
      global = if config.global then '-g' else ''
      # Get installed packages
      installed = []
      {stdout} = await @execute
        command: "npm list --json #{global}"
        code: [0, 1]
        cwd: config.cwd
        stdout_log: false
        metadata: shy: true
      pkgs = JSON.parse stdout
      installed = Object.keys pkgs.dependencies if Object.keys(pkgs).length
      # Uninstall
      uninstall = config.name.filter (pkg) -> pkg in installed
      return unless uninstall.length
      await @execute
        command: "npm uninstall #{global} #{uninstall.join ' '}"
        cwd: config.cwd
        sudo: config.sudo
      log message: "NPM uninstalled packages: #{uninstall.join ', '}"

## Export

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        schema: schema
