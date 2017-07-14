
nikita = require '../../src'
test = require '../test'
fs = require 'fs'

describe 'api child', ->

  scratch = test.scratch @

  it 'dont change status of parent context', ->
    touched = 0
    n = nikita()
    n.call (options, next) ->
      n
      .child()
      .file.touch
        target: "#{scratch}/a_file"
      .then (err, changed) ->
        touched++
        changed.should.be.true()
        next err
    .then (err, changed) ->
      changed.should.be.false()
      touched.should.eql 1
    .promise()

  # it 'accept conditions', (next) ->
  #   touched = 0
  #   m = nikita
  #   .call (options, next) ->
  #     m
  #     .child()
  #     .file.touch
  #       target: "#{scratch}/a_file"
  #     .then (err, changed) ->
  #       touched++
  #       changed.should.be.true()
  #       next err
  #   .then (err, changed) ->
  #     changed.should.be.false()
  #     touched.should.eql 1
  #     next()
