
nikita = require '@nikitajs/engine/lib'
{tags, ssh, service} = require './test'
they = require('ssh2-they').configure ssh

return unless tags.service_startup or tags.service_systemctl

describe 'service config startup', ->

  describe 'schema', ->

    it 'requires config `name`, `srv_name` or `chk_name`', ->
      nikita
      .service
        startup: true
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'multiple errors where found in the configuration of action `service`:'
          '#/dependencies/startup/anyOf config should match some schema in anyOf;'
          '#/dependencies/startup/anyOf/0/required config should have required property \'name\';'
          '#/dependencies/startup/anyOf/1/required config should have required property \'srv_name\';'
          '#/dependencies/startup/anyOf/2/required config should have required property \'chk_name\'.'
        ].join ' '

  describe 'action', ->

    @timeout 30000

    they 'activate startup with boolean true', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        @service.remove
          name: service.name
        {status} = await @service
          name: service.name
          chk_name: service.chk_name
          startup: true
        status.should.be.true()
        {status} = await @service
          name: service.name
          chk_name: service.chk_name
          startup: true
        status.should.be.false()
    
    they 'activate startup with boolean false', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        @service.remove
          name: service.name
        {status} = await @service
          name: service.name
          chk_name: service.chk_name
          startup: false
        status.should.be.true()
        {status} = await @service
          name: service.name
          chk_name: service.chk_name
          startup: false
        status.should.be.false()

    they 'activate startup with string', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        {status} = await @execute 'which chkconfig', code_skipped: 1
        return unless status
        @service.remove
          name: service.name
        {status} = await @service
          name: service.name
          chk_name: service.chk_name
          startup: '235'
        status.should.be.true()
        {status} = await @service
          chk_name: service.chk_name
          startup: '235'
        status.should.be.false()

    they 'detect change in startup', ({ssh}) ->
      # Startup levels only apply to chkconfig
      # Note, on CentOS 7, chkconfig is installed but Nikita wont use it
      # if it detect systemctl
      nikita
        ssh: ssh
      , ->
        try
          await @execute '! command -v systemctl && command -v chkconfig'
          @service.remove
            name: service.name
          {status} = await @service
            name: service.name
            chk_name: service.chk_name
            startup: '2345'
          status.should.be.true()
          {status} = await @service
            chk_name: service.chk_name
            startup: '2345'
          status.should.be.false()
        catch err
          return
