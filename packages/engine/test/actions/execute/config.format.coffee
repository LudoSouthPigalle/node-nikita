
nikita = require '../../../src'
{tags, ssh} = require '../../test'
they = require('ssh2-they').configure ssh

describe 'actions.execute.config.sudo', ->

  they 'json', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      {stdout, data} = await @execute
        command: 'echo \'{"key": "value"}\''
        format: 'json'
      stdout.should.eql '{"key": "value"}\n'
      data.should.eql key: "value"

  they 'yaml', ({ssh}) ->
    nikita
      ssh: ssh
    , ->
      {stdout, data} = await @execute
        command: '''
        cat <<YAML
        key: value
        YAML
        '''
        format: 'yaml'
      stdout.should.eql 'key: value\n'
      data.should.eql key: "value"