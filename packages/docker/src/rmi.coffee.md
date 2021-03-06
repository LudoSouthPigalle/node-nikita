
# `nikita.docker_rmi`

Remove images. All container using image should be stopped to delete it unless
force options is set.

## Output

* `err`   
  Error object if any.
* `status`   
  True if image was removed.

## Hook

    on_action = ({config, metadata}) ->
      config.image = metadata.argument if metadata.argument?

## Schema

    schema =
      type: 'object'
      properties:
        # ...docker.wrap_schema
        'cwd':
          type: 'string'
          description: """
          Change the build working directory.
          """
        'docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/docker'
        'image':
          type: 'string'
          description: """
          Name of the Docker image present in the registry.
          """
        'no_prune':
          type: 'boolean'
          description: """
          Do not delete untagged parents.
          """
        'tag':
          type: 'string'
          description: """
          Tag of the Docker image, default to latest.
          """
      required: ['image']

## Handler

    handler = ({config}) ->
      await @docker.tools.execute
        command: [
          'images'
          "| grep '#{config.image} '"
          "| grep ' #{config.tag} '" if config.tag?
        ].join ' '
        code_skipped: [1]
      await @docker.tools.execute
        command: [
          'rmi'
          (
            ['force', 'no_prune']
            .filter (opt) -> config[opt]?
            .map (opt) -> " --#{opt.replace '_', '-'}"
          )
           " #{config.image}"
           ":#{config.tag}" if config.tag?
        ].join ''
        if: ({parent}) ->
          parent.parent.tools.status -1

## Exports

    module.exports =
      handler: handler
      hooks:
        on_action: on_action
      metadata:
        global: 'docker'
        schema: schema
