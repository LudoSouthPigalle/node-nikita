
nikita = require '../../../src'
utils = require '../../../src/utils'
{tags, config} = require '../../test'
they = require('mocha-they')(config)

describe 'actions.fs.chmod', ->
  return unless tags.posix

  they 'change a permission of a file', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.base.writeFile
        content: ''
        mode: 0o0644
        target: "#{tmpdir}/a_file"
      @fs.chmod
        mode: 0o0600
        target: "#{tmpdir}/a_file"
      {stats} = await @fs.base.stat "#{tmpdir}/a_file"
      utils.mode.compare(stats.mode, 0o0600).should.be.true()

  they 'mode as string', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.base.writeFile
        content: ''
        mode: 0o0644
        target: "#{tmpdir}/a_file"
      @fs.chmod
        mode: '600'
        target: "#{tmpdir}/a_file"
      .should.be.finally.containEql status: true
      {stats} = await @fs.base.stat "#{tmpdir}/a_file"
      utils.mode.compare(stats.mode, 0o0600).should.be.true()

  they 'change status', ({ssh}) ->
    nikita
      ssh: ssh
      metadata: tmpdir: true
    , ({metadata: {tmpdir}}) ->
      @fs.base.writeFile
        content: ''
        mode: 0o0754
        target: "#{tmpdir}/a_file"
      {status} = await @fs.chmod
        target: "#{tmpdir}/a_file"
        mode: 0o0744
      status.should.be.true()
      {status} = await @fs.chmod
        target: "#{tmpdir}/a_file"
        mode: 0o0744
      status.should.be.false()
