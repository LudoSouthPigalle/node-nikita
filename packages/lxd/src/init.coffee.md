
# `nikita.lxd.init`

Initialize a Linux Container with given image name, container name and config.

## Output

* `err`
  Error object if any
* `info.status`
  Was the container successfully created

## Example

```js
const {status} = await nikita.lxd.init({
  image: "ubuntu:18.04",
  container: "my_container"
})
console.info(`Container was created: ${status}`)
```

## Implementation details

The current version 3.18 of lxd has an issue with lxc init waiting for
configuration from stdin when there is no tty. This used to work before. Use
`[ -t 0 ] && echo 'tty' || echo 'notty'` to detect the tty. The current
fix is to prepend the init command with `echo '' | `.

## TODO

We do not honors the configuration (`-c`) argument. Use the `lxd.config.set` for
now.

## Schema

    schema =
      type: 'object'
      properties:
        'image':
          type: 'string'
          description: """
          The image the container will use, name:[version] (e.g: ubuntu:16.04.).
          """
        'container':
          type: 'string'
          pattern: "(^[a-zA-Z][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9](?!\-)$)|(^[a-zA-Z]$)"
          description: """
          The name of the container. Must:
          - be between 1 and 63 characters long
          - be made up exclusively of letters, numbers and dashes from the ASCII table
          - not start with a digit or a dash
          - not end with a dash
          """
        'network':
          type: 'string'
          description: """
          Network name to add to the container (see lxd.network).
          """
        'storage':
          type: 'string'
          description: """
          Storage name where to store the container, [default_storage] by
          default.
          """
        'profile':
          type: 'string'
          description: """
          Profile to set this container up.
          """
        'ephemeral':
          type: 'boolean'
          default: false
          description: """
          If true, the container will be deleted when stopped.
          """
        'vm':
          type: 'boolean'
          default: false
          description: """
          If true, instantiate a VM instead of a container.
          """
        'target':
          type: 'string'
          description: """
          If the LXC is clustered, instantiate the container on a specific node.
          """
      required: ['image', 'container']

## Handler

    handler = ({config}) ->
      command_init = [
        'lxc', 'init', config.image, config.container
        "--network #{config.network}" if config.network
        "--storage #{config.storage}" if config.storage
        "--ephemeral" if config.ephemeral
        "--vm" if config.vm
        "--profile #{config.profile}" if config.profile
        "--target #{config.target}" if config.target
      ].join ' '
      # Execution
      await @execute
        command: """
        lxc remote get-default
        lxc info #{config.container} >/dev/null && exit 42
        echo '' | #{command_init}
        """
        code_skipped: 42

## Export

    module.exports =
      handler: handler
      metadata:
        schema: schema
