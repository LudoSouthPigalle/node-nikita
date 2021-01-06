
nikita = require '@nikitajs/engine/lib'
{tags, ssh} = require '../test'
they = require('ssh2-they').configure ssh

return unless tags.tools_cron

###
Note on OSX, by default, I got the message "crontab: no crontab for {user} - using an empty one"

```
crontab -e
30 * * * * /usr/bin/curl --silent --compressed http://www.adaltas.com
crontab -l
```
###

describe 'tools.cron.add', ->

  describe 'schema', ->

    it 'invalid job: no time', ->
      nikita
      .service 'cronie'
      .tools.cron.add
        command: '/remove/me'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `tools.cron.add`:'
          '#/required config should have required property \'when\'.'
        ].join ' '

    it 'invalid job: invalid time', ->
      nikita
      .service 'cronie'
      .tools.cron.add
        command: '/remove/me'
        when: true
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `tools.cron.add`:'
          '#/properties/when/type config.when should be string, type is "string".'
        ].join ' '

    it 'invalid job: no command', ->
      nikita
      .service 'cronie'
      .tools.cron.add
        when: '1 2 3 4 5'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `tools.cron.add`:'
          '#/required config should have required property \'command\'.'
        ].join ' '

    it 'invalid job: invalid command', ->
      nikita
      .service 'cronie'
      .tools.cron.add
        command: ''
        when: '1 2 3 4 5'
      .should.be.rejectedWith
        code: 'NIKITA_SCHEMA_VALIDATION_CONFIG'
        message: [
          'NIKITA_SCHEMA_VALIDATION_CONFIG:'
          'one error was found in the configuration of action `tools.cron.add`:'
          '#/properties/command/minLength config.command should NOT be shorter than 1 characters, limit is 1.'
        ].join ' '

  describe 'action', ->

    rand = Math.random().toString(36).substring(7)

    they 'add a job', ({ssh}) ->
      nikita
        ssh: ssh
      , ->
        @service 'cronie'
        {status} = await @tools.cron.add
          command: "/bin/true #{rand}/toto - *.mp3"
          when: '0 * * * *'
        status.should.be.true()
        {status} = await @tools.cron.add
          command: "/bin/true #{rand}/toto - *.mp3"
          when: '0 * * * *'
        status.should.be.false()
        @tools.cron.remove
          command: "/bin/true #{rand}/toto - *.mp3"
          when: '0 * * * *'

    describe 'match', ->

      they 'regexp', ({ssh}) ->
        nikita
          ssh: ssh
        , ->
          @service 'cronie'
          {status} = await @tools.cron.add
            command: "/bin/true #{rand}"
            when: '0 * * * *'
            match: '.*bin.*'
          status.should.be.true()
          {status} = await @tools.cron.add
            command: "/bin/false #{rand}"
            when: '0 * * * *'
            match: /.*bin.*/
            diff: (diff) ->
              diff.should.eql [
                { count: 1, added: undefined, removed: true, value: "0 * * * * /bin/false #{rand}" }
                { count: 1, added: true, removed: undefined, value: "0 * * * * /bin/true #{rand}" }
              ]
          status.should.be.true()
          {status} = await @tools.cron.add
            command: "/bin/false #{rand}"
            when: '0 * * * *'
            match: /.*bin.*/
          status.should.be.false()
          @tools.cron.remove
            command: "/bin/false #{rand}"
            when: '0 * * * *'

      they 'string', ({ssh}) ->
        nikita
          ssh: ssh
        , ->
          @service 'cronie'
          {status} = await @tools.cron.add
            command: "/bin/true #{rand}"
            when: '0 * * * *'
            match: '.*bin.*'
          status.should.be.true()
          {status} = await @tools.cron.add
            command: "/bin/false #{rand}"
            when: '0 * * * *'
            match: '.*bin.*'
            diff: (diff) ->
              diff.should.eql [
                { count: 1, added: undefined, removed: true, value: "0 * * * * /bin/false #{rand}" }
                { count: 1, added: true, removed: undefined, value: "0 * * * * /bin/true #{rand}" }
              ]
          status.should.be.true()
          {status} = await @tools.cron.add
            command: "/bin/false #{rand}"
            when: '0 * * * *'
            match: '.*bin.*'
          status.should.be.false()
          @tools.cron.remove
            command: "/bin/false #{rand}"
            when: '0 * * * *'

    describe 'error', ->

      they 'invalid job: invalid command to exec', ({ssh}) ->
        nikita
          ssh: ssh
        , ->
          @service 'cronie'
          @tools.cron.add
            command: 'azertyytreza'
            when: '1 2 3 4 5'
            exec: true
          .should.be.rejectedWith
            exit_code: 127
