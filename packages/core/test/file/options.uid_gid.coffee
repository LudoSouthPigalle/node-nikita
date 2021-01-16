
nikita = require '../../src'
{tags, ssh, scratch} = require '../test'
they = require('mocha-they')(config)...

return unless tags.system_user

describe 'file options uid gid', ->

  they 'default to user gid on creation', ({ssh}) ->
    nikita
      ssh: null
    .system.user.remove 'toto'
    .system.group.remove 'toto', gid: 2345
    .system.group 'toto', gid: 2345
    .system.user 'toto', uid: 2345, gid: 2345
    .file.touch "#{scratch}/a_file", uid: 'toto'
    .file.assert
      target: "#{scratch}/a_file"
      uid: 2345
      gid: 2345
    .promise()

  they 'preserve gid if uid changed on update', ({ssh}) ->
    nikita
      ssh: null
    .system.user.remove 'toto'
    .system.user.remove 'lulu'
    .system.group.remove 'toto', gid: 2345
    .system.group.remove 'lulu', gid: 2346
    .system.group 'toto', gid: 2345
    .system.group 'lulu', gid: 2346
    .system.user 'toto', uid: 2345, gid: 2345
    .system.user 'lulu', uid: 2346, gid: 2346
    .file.touch "#{scratch}/a_file", uid: 'toto'
    .file target: "#{scratch}/a_file", content: 'ok', uid: 'lulu'
    .file.assert
      target: "#{scratch}/a_file"
      uid: 2346
      gid: 2345
    .promise()

  they 'throw Error is username does not exists', ({ssh}) ->
    nikita
      ssh: null
    .system.user.remove 'toto'
    .file.touch
      target: "#{scratch}/a_file"
      uid: 'toto'
      relax: true
    , (err) ->
      err.message.should.eql 'Invalid Option: no uid matching "toto"'
    .promise()
