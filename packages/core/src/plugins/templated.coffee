
selfTemplated = require 'self-templated'

module.exports =
  name: '@nikitajs/core/src/plugins/templated'
  hooks:
    'nikita:session:action':
      after: [
        '@nikitajs/core/src/plugins/schema'
        # '@nikitajs/core/src/metadata/tmpdir'
      ]
      handler: (action) ->
        templated = await action.tools.find (action) -> action.metadata.templated
        return if templated is false
        selfTemplated action,
          array: true
          compile: false
          mutate: true
          partial:
            metadata: true
            config: true
