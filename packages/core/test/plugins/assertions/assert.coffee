
nikita = require '../../../src'

describe 'plugin.assertions assert', ->
  
  describe 'array', ->

    it 'success if all assertion are `true`', ->
      nikita.call
        assert: [ (-> true), (-> true)]
        handler: (->)
      .should.be.resolved()

    it 'skip if one conditions is `false`', ->
      nikita.call
        assert: [ (-> true), (-> false), (-> true)]
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_INVALID_ASSERTION'
  
  describe 'boolean, integer', ->

    it 'success if `true`', ->
      nikita.call
        assert: true
        handler: -> true
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'success if `false`', ->
      nikita.call
        assert: false
        handler: -> false
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'success if `1`', ->
      nikita.call
        assert: 1
        handler: -> 1
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'success if `0`', ->
      nikita.call
        assert: 0
        handler: -> 0
        metadata:
          raw_output: true
      .should.be.resolved()
          
  describe 'null, undefined', ->

    it 'success if `null`', ->
      nikita.call
        assert: null
        handler: -> null
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'success if `undefined`', ->
      nikita.call
        assert: undefined
        handler: -> undefined
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'error because `null` dont match `undefined`', ->
      nikita.call
        assert: null
        handler: -> undefined
        metadata:
          raw_output: true
      .should.be.rejected()
  
  describe 'string + buffer', ->
  
    it 'run if `"string"`', ->
      nikita.call
        assert: 'abc'
        handler: -> 'abc'
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'success if string match template `{{"abc"}}`',->
      nikita.call
        assert: result: '{{config.db.test}}'
        db: test: 'abc'
        handler: -> result: 'abc'
      .should.be.resolved()

    it 'success if empty string match template `{{""}}`',->
      nikita.call
        assert: result: '{{config.db.test}}'
        db: test: ''
        handler: -> result: ''
      .should.be.resolved()

    it 'success if regexp match string', -> # was skipped
      nikita.call
        assert: result: /^\w+$/
        handler: -> result: 'abc'
      .should.be.resolved()

    it 'success if string match empty', -> # was skipped
      nikita.call
        assert: result: ''
        handler: -> result: ''
      .should.be.resolved()

    it 'success if buffer match string', ->
      nikita.call
        assert: Buffer.from 'abc'
        handler: -> 'abc'
        metadata:
          raw_output: true
      .should.be.resolved()

    it 'error if buffer dont match string', ->
      nikita.call
        assert: Buffer.from 'abc'
        handler: -> 'def'
        metadata:
          raw_output: true
      .should.be.rejected()
    
  describe 'object', ->

    it 'sucess when some keys are matching', ->
      nikita.call
        assert: {k:"v"}
        handler: -> a: 'b', k: 'v'
      .should.be.resolved()

    it 'error when no keys are matching', ->
      nikita.call
        assert: {k:"v"}
        handler: -> a: 'b', c: 'd'
      .should.be.rejected()
  
  describe 'function', ->

    it 'success when action returns true', ->
      nikita.call
        assert: -> true
        handler: (->)
      .should.be.resolved()

    it 'success when action resolve true', ->
      nikita.call
        assert: -> new Promise (resolve) ->
          setImmediate -> resolve true
        handler: (->)
      .should.be.resolved()

    it 'error if action returns false', ->
      nikita.call
        assert: -> false
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_INVALID_ASSERTION'

    it 'error if action resolve false', ->
      nikita.call
        assert: -> new Promise (resolve) ->
          setImmediate -> resolve false
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_INVALID_ASSERTION'

    it 'success if all validate', ->
      nikita.call
        assert: [
          -> true
          -> true
        ]
        handler: (->)
      .should.be.resolved()
      
    it 'error if not all validate', ->
      {status, value} = await nikita.call
        assert: [
          -> true
          -> false
        ]
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_INVALID_ASSERTION'

    
