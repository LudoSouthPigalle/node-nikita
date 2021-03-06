
# `nikita.lxd.network.attach`

Attach an existing network to a container.

## Output

* `err`   
  Error object if any.
* `status`   
  True if the network was attached.

## Example

```js
const {status} = await nikita.lxd.network.attach({
  network: 'network0',
  container: 'container1'
})
console.info(`Network was attached: ${status}`)
```

## Schema

    schema =
      type: 'object'
      properties:
        'network':
          type: 'string'
          description: """
          The network name to attach.
          """
        'container':
          $ref: 'module://@nikitajs/lxd/src/init#/properties/container'
      required: ['network', 'container']

## Handler

    handler = ({config}) ->
      #Build command
      command_attach = [
        'lxc'
        'network'
        'attach'
        config.network
        config.container
      ].join ' '
      #Execute
      await @execute
        command: """
        lxc config device list #{config.container} | grep #{config.network} && exit 42
        #{command_attach}
        """
        code_skipped: 42

## Export

    module.exports =
      handler: handler
      metadata:
        schema: schema
