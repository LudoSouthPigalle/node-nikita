
nikita = require '../../../src'

describe 'plugin.assertions unassert', ->
  
  describe 'array', ->

    it 'success if all assertion are `false`', ->
      nikita.call
        unassert: [ (-> false), (-> false)]
        handler: (->)
      .should.be.resolved()

    it 'error if one conditions is `true`', ->
      nikita.call
        unassert: [ (-> false), (-> true), (-> false)]
        handler: (->)
      .should.be.rejectedWith
        code: 'NIKITA_INVALID_ASSERTION'
  
  describe 'boolean, integer', ->
  
    it 'success if `true` with `false`', ->
      nikita.call
        unassert: true
        handler: -> false
        metadata:
          raw_output: true
      .should.be.resolved()
  
    it 'error if `true`', ->
      nikita.call
        unassert: true
        handler: -> true
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'sucess if `false` with `true`', ->
      nikita.call
        unassert: false
        handler: -> true
        metadata:
          raw_output: true
      .should.be.resolved()
  
    it 'error if `false`', ->
      nikita.call
        unassert: false
        handler: -> false
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'error if `1`', ->
      nikita.call
        unassert: 1
        handler: -> 1
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'error if `0`', ->
      nikita.call
        unassert: 0
        handler: -> 0
        metadata:
          raw_output: true
      .should.be.rejected()
  
  describe 'null, undefined', ->
  
    it 'error if `null`', ->
      nikita.call
        unassert: null
        handler: -> null
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'error if `undefined`', ->
      nikita.call
        unassert: undefined
        handler: -> undefined
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'success because `null` dont match `undefined`', ->
      nikita.call
        unassert: null
        handler: -> undefined
        metadata:
          raw_output: true
      .should.be.resolved()
  
  describe 'string + buffer', ->
  
    it 'run if `"string"`', ->
      nikita.call
        unassert: 'abc'
        handler: -> 'abc'
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'success if string match template `{{"abc"}}`',->
      nikita.call
        unassert: result: '{{config.db.test}}'
        db: test: 'abc'
        handler: -> result: 'abc'
      .should.be.rejected()
  
    it 'success if empty string match template `{{""}}`',->
      nikita.call
        unassert: result: '{{config.db.test}}'
        db: test: ''
        handler: -> result: ''
      .should.be.rejected()
  
    it 'success if regexp match string', -> # was skipped
      nikita.call
        unassert: result: /^\w+$/
        handler: -> result: 'abc'
      .should.be.rejected()
  
    it 'success if string match empty', -> # was skipped
      nikita.call
        unassert: result: ''
        handler: -> result: ''
      .should.be.rejected()
  
    it 'success if buffer match string', ->
      nikita.call
        unassert: Buffer.from 'abc'
        handler: -> 'abc'
        metadata:
          raw_output: true
      .should.be.rejected()
  
    it 'error if buffer dont match string', ->
      nikita.call
        unassert: Buffer.from 'abc'
        handler: -> 'def'
        metadata:
          raw_output: true
      .should.be.resolved()
  
  describe 'object', ->
  
    it 'sucess when some keys are matching', ->
      nikita.call
        unassert: {k:"v"}
        handler: -> a: 'b', k: 'v'
      .should.be.rejected()
  
    it 'error when no keys are matching', ->
      nikita.call
        unassert: {k:"v"}
        handler: -> a: 'b', c: 'd'
      .should.be.resolved()
  
  describe 'function', ->
  
    it 'success when action returns true', ->
      nikita.call
        unassert: -> true
        handler: (->)
      .should.be.rejected()
  
    it 'success when action resolve true', ->
      nikita.call
        unassert: -> new Promise (resolve) ->
          setImmediate -> resolve true
        handler: (->)
      .should.be.rejected()
  
    it 'error if action returns false', ->
      nikita.call
        unassert: -> false
        handler: (->)
      .should.be.resolved()
  
    it 'error if action resolve false', ->
      nikita.call
        unassert: -> new Promise (resolve) ->
          setImmediate -> resolve false
        handler: (->)
      .should.be.resolved()
  
    it 'success if all fail', ->
      nikita.call
        unassert: [
          -> false
          -> false
        ]
        handler: (->)
      .should.be.resolved()
  
    it 'error if all validate', ->
      nikita.call
        unassert: [
          -> true
          -> true
        ]
        handler: (->)
      .should.be.rejected()
  
    it 'error if not all fail', ->
      {status, value} = await nikita.call
        unassert: [
          -> true
          -> false
        ]
        handler: (->)
      .should.be.rejected()
  
  
