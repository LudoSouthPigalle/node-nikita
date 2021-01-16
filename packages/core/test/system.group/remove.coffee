
nikita = require '../../src'
{tags, config} = require '../test'
they = require('mocha-they')(config)...

return unless tags.system_user

describe 'system.group.remove', ->
  
  they 'handle status', ({ssh}) ->
    nikita
      ssh: ssh
    .system.user.remove 'toto'
    .system.group.remove 'toto'
    .system.group 'toto'
    .system.group.remove 'toto', (err, {status}) ->
      status.should.be.true() unless err
    .system.group.remove 'toto', (err, {status}) ->
      status.should.be.false() unless err
    .promise()
