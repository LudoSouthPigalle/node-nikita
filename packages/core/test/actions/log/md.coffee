
nikita = require '../../../src'
{tags, config} = require '../../test'
they = require('mocha-they')(config)

return unless tags.posix

describe 'actions.log.md', ->
  
  they 'write entering message', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @log.md basedir: tmpdir
      @fs.assert
        target: "#{tmpdir}/localhost.log"
        content: /^Entering.*$/mg

  they 'write message', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @log.md basedir: tmpdir
      @call ({tools: {log}})->
        log message: 'ok'
      @fs.assert
        trim: true
        filter: [
          /^Entering.*$/mg
        ]
        target: "#{tmpdir}/localhost.log"
        content: "ok"
  
  they 'write message and module', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}})->
      @log.md basedir: tmpdir
      @call ({tools: {log}}) ->
        log message: 'ok', module: 'nikita/test/log/md'
      @fs.assert
        trim: true
        filter: [
          /^Entering.*$/mg
        ]
        target: "#{tmpdir}/localhost.log"
        content: 'ok (1.INFO, written by nikita/test/log/md)'

  describe 'header', ->
  
    they 'honors header', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}})->
        @log.md basedir: tmpdir
        @call metadata: header: 'h1', ({tools: {log}}) ->
          log message: 'ok 1'
          await @call ->
            new Promise (resolve) ->
              setTimeout ->
                resolve()
              , 500
          @call metadata: header: 'h2', ({tools: {log}}) ->
            log message: 'ok 2'
        @fs.assert
          trim: true
          filter: [
            /^Entering.*$/mg
          ]
          target: "#{tmpdir}/localhost.log"
          content: """
          # h1
          
          ok 1
          
          ## h1 : h2
          
          ok 2
          """
      
    they 'honors header', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}})->
        @log.md basedir: tmpdir
        @call metadata: header: 'h1', ->
          @call metadata: header: 'h2', ({tools: {log}}) ->
            log message: 'ok 2'
        @fs.assert
          trim: true
          filter: [
            /^Entering.*$/mg
          ]
          target: "#{tmpdir}/localhost.log"
          content: """
          # h1
          
          ## h1 : h2
          
          ok 2
          """

  describe 'execute', ->
    
    they 'honors stdout_stream', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}})->
        @log.md basedir: tmpdir
        @execute """
        echo 'this is a one line output'
        """
        {data} = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        data.should.containEql """
          ```stdout
          this is a one line output
          
          ```
          """
          
    they 'stdin one line', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}})->
        @log.md basedir: tmpdir
        @execute """
        echo 'this is a first line'
        """
        {data} = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        data.should.containEql """
          Running Command: `echo 'this is a first line'`
          """
          
    they 'stdin multi line', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}})->
        @log.md basedir: tmpdir
        @execute """
        echo 'this is a first line'
        echo 'this is a second line'
        """
        {data} = await @fs.base.readFile
          target: "#{tmpdir}/localhost.log"
          encoding: 'utf8'
        data.should.containEql """
          ```stdin
          echo 'this is a first line'
          echo 'this is a second line'
          ```
          """
