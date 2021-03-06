
# `nikita.docker.login`

Register or log in to a Docker registry server.

## Output

* `err`   
  Error object if any.   
* `status`   
  True when the command was executed successfully.
* `stdout`   
  Stdout value(s) unless `stdout` option is provided.
* `stderr`   
  Stderr value(s) unless `stderr` option is provided.

## Schema

    schema =
      type: 'object'
      properties:
        'docker':
          $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/docker'
        'email':
          type: 'string'
          description: """
          User email.
          """
        'password':
          type: 'string'
          description: """
          User password.
          """
        'user':
          type: 'string'
          description: """
          Username of the user.
          """

## Handler

    handler = ({config}) ->
      await @docker.tools.execute
        command: [
          'login'
          ...(
            ['email', 'user', 'password']
            .filter (opt) ->
              config[opt]?
            .map (opt) ->
              "-#{opt.charAt 0} #{config[opt]}"
          )
          "#{utils.string.escapeshellarg config.registry}" if config.registry?
        ].join ' '

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'docker'
        schema: schema

## Dependencies

    utils = require './utils'
