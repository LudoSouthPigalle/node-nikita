
{is_object, is_object_literal} = require 'mixme'
utils = require '../utils'

module.exports =
  name: '@nikitajs/core/src/metadata/status'
  require: [
    '@nikitajs/core/src/plugins/history'
    '@nikitajs/core/src/metadata/raw'
  ]
  hooks:
    # 'nikita:registry:normalize': (action) ->
    #   action.metadata ?= {}
    #   action.metadata.shy ?= false
    'nikita:session:normalize': (action, handler) ->
      # Do not default shy to false or metadata from the registry will be overwritten
      # Todo: create a test to illutrate it
      # action.metadata.shy ?= false
      # Register action
      action.registry.register ['status'],
        metadata: raw: true
        handler: ({parent, args: [position]}) ->
          if typeof position is 'number'
            parent.children.slice(position)[0].output.status
          else unless position?
            parent.children.some (child) -> child.output.status
          else
            throw utils.error 'NIKITA_STATUS_POSITION_INVALID', [
              'argument position must be an integer if defined,'
              "get #{JSON.stringify position}"
            ]
      ->
        # Handler execution
        action = await handler.apply null, arguments
        # Register `status` operation
        action.tools ?= {}
        action.tools.status = (index) ->
          if arguments.length is 0
            action.children.some (sibling) ->
              not sibling.metadata.shy and sibling.output?.status is true
          else
            l = action.children.length
            i =  if index < 0 then (l + index) else index
            sibling = action.children[i]
            throw Error "Invalid Index #{index}" unless sibling
            sibling.output.status
        action
    'nikita:session:result':
      before: '@nikitajs/core/src/plugins/history'
      handler: ({action, error, output}) ->
        inherit = (output) ->
          output ?= {}
          output.status = action.children.some (child) ->
            return false if child.metadata.shy
            child.output?.status is true
          output
        if not error and not action.metadata.raw_output
          arguments[0].output =
            if typeof output is 'boolean'
              status: output
            else if is_object_literal output
              if output.hasOwnProperty 'status'
                output.status = !!output.status
                output
              else
                inherit output
            else if not output?
              inherit output
            else if is_object output
              output
            else if Array.isArray(output) or typeof output in ['string', 'number']
              output
            else
              throw utils.error 'HANDLER_INVALID_OUTPUT', [
                'expect a boolean or an object or nothing'
                'unless the `raw_output` configuration is activated,'
                "got #{JSON.stringify output}"
              ]
      
            
