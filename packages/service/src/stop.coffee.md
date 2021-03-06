
# `nikita.service.stop`

Stop a service.
Note, does not throw an error if service is not installed.

## Output

* `err`   
  Error object if any.   
* `status`   
  Indicates if the service was stopped ("true") or if it was already stopped 
  ("false").   

## Example

```js
const {status} = await nikita.service.stop([{
  ssh: ssh,
  name: 'gmetad'
})
console.info(`Service was stopped: ${status}`)
```

## Hooks

    on_action = ({config, metadata}) ->
      config.name = metadata.argument if typeof metadata.argument is 'string'

## Schema

    schema =
      type: 'object'
      properties:
        'arch_chroot':
          $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/arch_chroot'
        'name':
          $ref: 'module://@nikitajs/service/src/install#/properties/name'
        'rootdir':
          $ref: 'module://@nikitajs/core/lib/actions/execute#/properties/rootdir'
      required: ['name']

## Handler

    handler = ({config, tools: {log}}) ->
      log message: "Stop service #{config.name}", level: 'INFO'
      try
        {status} = await @execute
          command: """
          ls \
            /lib/systemd/system/*.service \
            /etc/systemd/system/*.service \
            /etc/rc.d/* \
            /etc/init.d/* \
            2>/dev/null \
          | grep -w "#{config.name}" || exit 3
          if command -v systemctl >/dev/null 2>&1; then
            systemctl status #{config.name} || exit 3
            systemctl stop #{config.name}
          elif command -v service >/dev/null 2>&1; then
            service #{config.name} status || exit 3
            service #{config.name} stop
          else
            echo "Unsupported Loader" >&2
            exit 2
          fi
          """
          code_skipped: 3
          arch_chroot: config.arch_chroot
          rootdir: config.rootdir
        log message: "Service is stopped", level: 'INFO' if status
        log message: "Service already stopped", level: 'WARN' if not status
      catch err
        throw Error "Unsupported Loader" if err.exit_code is 2

## Export

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        schema: schema
