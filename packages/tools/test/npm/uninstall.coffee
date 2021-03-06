
nikita = require '@nikitajs/core/lib'
{tags, config} = require '../test'
they = require('mocha-they')(config)

return unless tags.tools_npm

describe 'tools.npm.uninstall', ->

  describe 'schema', ->

    it 'name is required', ->
      nikita
        metadata: tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @tools.npm.uninstall
          cwd: tmpdir
        .should.be.rejectedWith
          code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
          message: [
            'NIKITA_SCHEMA_VALIDATION_CONFIG:'
            'one error was found in the configuration of action `tools.npm.uninstall`:'
            '#/required config should have required property \'name\'.'
          ].join ' '

    it 'cwd or global is true are required', ->
      nikita {}
      , ->
        @tools.npm.uninstall
          name: 'coffeescript'
        .should.be.rejectedWith
          code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
          message: [
            'NIKITA_SCHEMA_VALIDATION_CONFIG:'
            'multiple errors where found in the configuration of action `tools.npm.uninstall`:'
            '#/if config should match "then" schema, failingKeyword is "then";'
            '#/then/required config should have required property \'cwd\'.'
          ].join ' '
        @tools.npm.uninstall
          config:
            name: 'coffeescript'
            global: true
        .should.eventually.not.be.rejected

  describe 'action', ->

    they 'uninstall locally', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}}) ->
        await @tools.npm
          cwd: tmpdir
          name: 'coffeescript'
        {status} = await @tools.npm.uninstall
          cwd: tmpdir
          name: 'coffeescript'
        status.should.be.true()
        {status} = await @tools.npm.uninstall
          cwd: tmpdir
          name: 'coffeescript'
        status.should.be.false()

    they 'uninstall locally in a current working directory', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}}) ->
        @fs.mkdir "#{tmpdir}/1_dir"
        @fs.mkdir "#{tmpdir}/2_dir"
        @tools.npm
          name: 'coffeescript'
          cwd: "#{tmpdir}/1_dir"
        @tools.npm
          name: 'coffeescript'
          cwd: "#{tmpdir}/2_dir"
        {status} = await @tools.npm.uninstall
          cwd: "#{tmpdir}/1_dir"
          name: 'coffeescript'
        status.should.be.true()
        {status} = await @tools.npm.uninstall
          cwd: "#{tmpdir}/2_dir"
          name: 'coffeescript'
        status.should.be.true()

    they 'uninstall globally', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @tools.npm
          config:
            name: 'coffeescript'
            global: true
            sudo: true
        {status} = await @tools.npm.uninstall
          config:
            name: 'coffeescript'
            global: true
            sudo: true
        status.should.be.true()
        {status} = await @tools.npm.uninstall
          config:
            name: 'coffeescript'
            global: true
            sudo: true
        status.should.be.false()

    they 'uninstall multiple packages', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}}) ->
        await @tools.npm
          cwd: tmpdir
          name: ['coffeescript', 'csv']
        {status} = await @tools.npm.uninstall
          cwd: tmpdir
          name: ['coffeescript', 'csv']
        status.should.be.true()
    
    they 'name as argument', ({ssh}) ->
      nikita
        ssh: ssh
        metadata: tmpdir: true
      , ({metadata: {tmpdir}}) ->
        await @tools.npm
          cwd: tmpdir
          name: 'coffeescript'
        {status} = await @tools.npm.uninstall 'coffeescript',
          cwd: tmpdir
        status.should.be.true()
