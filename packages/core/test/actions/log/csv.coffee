
fs = require 'fs'
nikita = require '../../../src'
{tags, config} = require '../../test'
they = require('mocha-they')(config)

return unless tags.posix

describe 'actions.log.csv', ->
  
  they 'write message', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @log.csv basedir: tmpdir
      @call ({tools: {log}}) -> log 'ok'
      {data} = await @fs.base.readFile "#{tmpdir}/localhost.log", encoding: 'ascii'
      data.should.eql 'text,INFO,"ok"\n'

  they 'write header', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @log.csv basedir: tmpdir
      @call metadata: header: 'h1', ({tools: {log}}) -> true
      {data} = await @fs.base.readFile "#{tmpdir}/localhost.log", encoding: 'ascii'
      data.should.eql 'header,,"h1"\n'
    
