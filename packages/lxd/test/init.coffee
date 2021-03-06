
nikita = require '@nikitajs/core/lib'
{config, images, tags} = require './test'
they = require('mocha-they')(config)

return unless tags.lxd

describe 'lxd.init', ->
  
  describe 'schema', ->
  
    it 'Container name is between 1 and 63 characters long', ->
      nikita
      .lxd.init
        image: "images:#{images.alpine}"
        container: "very-long-long-long-long-long-long-long-long-long-long-long-long-long-name"
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `lxd.init`:'
          '#/properties/container/pattern config/container should match pattern'
          '"(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)",'
          'pattern is "(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)".'
        ].join ' '
  
    it 'Container name accepts letters, numbers and dashes from the ASCII table', ->
      nikita
      .lxd.init
        image: "images:#{images.alpine}"
        container: 'my_name'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `lxd.init`:'
          '#/properties/container/pattern config/container should match pattern'
          '"(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)",'
          'pattern is "(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)".'
        ].join ' '
  
    it 'Container name should not start with a digit', ->
      nikita.lxd.init
        image: "images:#{images.alpine}"
        container: '1u'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `lxd.init`:'
          '#/properties/container/pattern config/container should match pattern'
          '"(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)",'
          'pattern is "(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)".'
        ].join ' '
    
    it 'Container name should not start with a dash', ->
      nikita.lxd.init
        image: "images:#{images.alpine}"
        container: '-u1'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `lxd.init`:'
          '#/properties/container/pattern config/container should match pattern'
          '"(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)",'
          'pattern is "(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)".'
        ].join ' '
  
    it 'Container name is not end with a dash', ->
      nikita
      .lxd.init
        image: "images:#{images.alpine}"
        container: 'u1-'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `lxd.init`:'
          '#/properties/container/pattern config/container should match pattern'
          '"(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)",'
          'pattern is "(^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?!-)$)|(^[a-zA-Z]$)".'
        ].join ' '
  
  describe 'action', ->
  
    they 'Init a new container', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'u1'
          force: true
        {status} = await @lxd.init
          image: "images:#{images.alpine}"
          container: 'u1'
        status.should.be.true()
  
    they 'Validate name', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'u1'
          force: true
        {status} = await @lxd.init
          image: "images:#{images.alpine}"
          container: 'u1'
        status.should.be.true()
  
    they 'Container already exist', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'u1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'u1'
        {status} = await @lxd.init
          image: "images:#{images.alpine}"
          container: 'u1'
        status.should.be.false()
  
    they 'Init new VM', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'vm1'
          force: true
        {status} = await @lxd.init
          image: "images:#{images.alpine}"
          container: 'vm1'
          vm: true
        status.should.be.true()
  
    they 'VM already exist', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        await @lxd.delete
          container: 'vm1'
          force: true
        await @lxd.init
          image: "images:#{images.alpine}"
          container: 'vm1'
          vm: true
        {status} = await @lxd.init
          image: "images:#{images.alpine}"
          container: 'vm1'
          vm: true
        status.should.be.false()
