
nikita = require '../../src'

describe 'plugins.templated', ->

  it 'access config', ->
    nikita
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'
      handler: ({config}) ->
        config
    .should.be.finally.containEql
      key_1: 'value 1'
      key_2: 'value 2 and value 1'
  
  it 'access parent', ->
    nikita
      key: 'value'
    , ->
      @call key: "get {{parent.config.key}} from parent", ({config}) -> config
      .should.be.finally.containEql
        key: 'get value from parent'

  it 'when `false`', ->
    nikita.call
      metadata: templated: false
    , ({metadata: {templated}}) ->
      templated.should.be.false()

  it 'disabled in current', ->
    nikita
      metadata: templated: false
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'
      handler: ({config}) -> config
    .should.be.finally.containEql
      key_1: 'value 1'
      key_2: 'value 2 and {{config.key_1}}'

  it 'disabled in parent', ->
    nikita ->
      @call
        metadata: templated: false
      , ->
        @call ->
          @call ->
            key_1: 'value 1'
            key_2: 'value 2 and {{config.key_1}}'
            handler: ({config}) -> config
          .should.be.finally.containEql
            key_1: 'value 1'
            key_2: 'value 2 and {{config.key_1}}'
        
