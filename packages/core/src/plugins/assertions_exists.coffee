
session = require '../session'
utils = require '../utils'
{mutate} = require 'mixme'

module.exports =
  name: '@nikitajs/core/src/plugins/assertions'
  require: [
    '@nikitajs/core/src/metadata/raw'
    '@nikitajs/core/src/metadata/disabled'
  ]
  hooks:
    'nikita:session:normalize':
      # This is hanging, no time for investigation
      # after: [
      #   '@nikitajs/core/src/plugins/assertions'
      # ]
      handler: (action, handler) ->
        # Ventilate assertions properties defined at root
        assertions = {}
        for property, value of action
          if /^(un)?assert_exists$/.test property
            throw Error 'ASSERTION_DUPLICATED_DECLARATION', [
              "Property #{property} is defined multiple times,"
              'at the root of the action and inside assertions'
            ] if assertions[property]
            value = [value] unless Array.isArray value
            assertions[property] = value
            delete action[property]
        ->
          action = await handler.call null, ...arguments
          mutate action.assertions, assertions
          action
    'nikita:session:result': ({action, error, output}) ->
      final_run = true
      for k, v of action.assertions
        continue unless handlers[k]?
        local_run = await handlers[k].call null, action
        final_run = false if local_run is false
      throw utils.error 'NIKITA_INVALID_ASSERTION', [
        'action did not validate the assertion'
      ] unless final_run

handlers =
  assert_exists: (action) ->
    final_run = true
    for assertion in action.assertions.assert_exists
      run = await session
        hooks:
          on_result: ({action}) -> delete action.parent
        metadata:
          condition: true
          depth: action.metadata.depth
          raw_output: true
          raw_input: true
        parent: action
      , ->
        {exists} = await @fs.base.exists target: assertion
        exists
      final_run = false if run is false
    final_run
  unassert_exists: (action) ->
    final_run = true
    for assertion in action.assertions.unassert_exists
      run = await session
        hooks:
          on_result: ({action}) -> delete action.parent
        metadata:
          condition: true
          depth: action.metadata.depth
          raw_output: true
        parent: action
      , ->
        {exists} = await @fs.base.exists target: assertion
        exists
      final_run = false if run is true
    final_run
