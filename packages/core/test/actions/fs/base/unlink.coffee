
nikita = require '../../../../src'
utils = require '../../../../src/utils'
{tags, config} = require '../../../test'
they = require('mocha-they')(config)

return unless tags.posix

describe 'actions.fs.base.unlink', ->

  they 'a file', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ->
      @fs.base.writeFile
        target: "{{parent.metadata.tmpdir}}/a_target"
        content: 'hello'
      @fs.base.unlink
        target: "{{parent.metadata.tmpdir}}/a_target"
      @fs.base.exists
        target: "{{parent.metadata.tmpdir}}/a_target"
      .should.be.finally.containEql exists: false

  they 'a link referencing a directory', ({ssh}) ->
    nikita
      ssh: ssh
      metadata:
        tmpdir: true
        dirty: true
    , ({metadata: {tmpdir}})->
      @fs.base.mkdir
        target: "{{parent.metadata.tmpdir}}/a_dir"
      @fs.base.symlink
        source: "{{parent.metadata.tmpdir}}/a_dir"
        target: "{{parent.metadata.tmpdir}}/a_target"
      @fs.base.unlink
        target: "{{parent.metadata.tmpdir}}/a_target"
      @fs.assert
        target: "{{parent.metadata.tmpdir}}/a_dir"
        filetype: 'directory'
      @fs.assert
        target: "{{parent.metadata.tmpdir}}/a_target"
        not: true

  they 'error ENOENT', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ->
      @fs.base.unlink
        target: "{{parent.metadata.tmpdir}}/a_target"
      .should.be.rejectedWith
        code: 'NIKITA_FS_UNLINK_ENOENT'
        message: /NIKITA_FS_UNLINK_ENOENT: the file to remove does not exists, got ".*\/a_target"/

  they 'error EPERM', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ->
      @fs.mkdir
        target: "{{parent.metadata.tmpdir}}/a_target"
      @fs.base.unlink
        target: "{{parent.metadata.tmpdir}}/a_target"
      .should.be.rejectedWith
        code: 'NIKITA_FS_UNLINK_EPERM'
        message: /NIKITA_FS_UNLINK_EPERM: you do not have the permission to remove the file, got ".*\/a_target"/
