
nikita = require '../../../../src'
utils = require '../../../../src/utils'
{tags, config} = require '../../../test'
they = require('mocha-they')(config)

return unless tags.posix

describe 'actions.fs.base.chmod', ->

  they 'create', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_target"
        content: 'hello'
      @fs.base.chmod
        mode: 0o600
        target: "{{parent.metadata.tmpdir}}/a_target"
      {stats} = await @fs.base.stat
        target: "{{parent.metadata.tmpdir}}/a_target"
      (stats.mode & 0o777).toString(8).should.eql '600'
