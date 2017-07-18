
nikita = require '../../src'
fs = require 'fs'

describe 'options "retry"', ->

  it 'stop once errorless', ->
    count = 0
    nikita
    .call retry: 5, wait: 500, (options) ->
      options.attempt.should.eql count++
      throw Error 'Catchme' if options.attempt < 2
    .call ->
      count.should.eql 3
    .promise()

  it 'retry x times', ->
    count = 0
    nikita
    .call retry: 3, wait: 500, (options) ->
      options.attempt.should.eql count++
      throw Error 'Catchme'
    .then (err) ->
      err.message.should.eql 'Catchme'
      count.should.eql 3
    .promise()

  it 'retry x times', ->
    logs = []
    nikita
    .on 'text', (log) -> logs.push log.message if /^Retry/.test log.message
    .call retry: 2, wait: 500, relax: true, (options) ->
      throw Error 'Catchme'
    .call ->
      logs.should.eql ['Retry on error, attempt 1']
    .promise()

  it 'retry true is unlimited', ->
    count = 0
    nikita
    .call retry: true, wait: 200, (options) ->
      throw Error 'Catchme' if count++ < 10
    .promise()
