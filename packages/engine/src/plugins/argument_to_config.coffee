

###
The `argument` plugin map an argument which is not an object into a configuration property.

###

module.exports =
  module: '@nikitajs/engine/src/plugins/argument'
  hooks:
    'nikita:session:action':
      handler: (action) ->
        if action.metadata.argument_to_config
          action.config[action.metadata.argument_to_config] ?= action.metadata.argument
