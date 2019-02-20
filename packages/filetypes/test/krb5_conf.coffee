
nikita = require '@nikitajs/core'
{tags, ssh, scratch} = require './test'
they = require('ssh2-they').configure ssh...

return unless tags.posix

describe 'file.types.krb5_conf', ->

  they 'write content (default MIT Kerberos file)', ({ssh}) ->
    nikita
      ssh: ssh
    .file.types.krb5_conf
      target: "#{scratch}/krb5.cnf"
      content:
        'logging':
          'default': 'SYSLOG:INFO:LOCAL1'
          'kdc': 'SYSLOG:NOTICE:LOCAL1'
          'admin_server': 'SYSLOG:WARNING:LOCAL1'
        'libdefaults':
          'dns_lookup_realm': false
          'dns_lookup_kdc': false
          'ticket_lifetime': '24h'
          'renew_lifetime': '7d'
          'forwardable': true
          'allow_weak_crypto': 'false'
          'ticket_lifetime': '24h'
          'clockskew': '300'
          'rdns': 'false'
        'realms': {}
        'domain_realm': {}
        'appdefaults':
          'pam':
            'debug': false
            'ticket_lifetime': 36000
            'renew_lifetime': 36000
            'forwardable': true
            'krb4_convert': false
        'dbmodules': {}
    , (err, {status}) ->
      status.should.be.true() unless err
    .file.assert
      target: "#{scratch}/krb5.cnf"
      content: """
      [logging]
       default = SYSLOG:INFO:LOCAL1
       kdc = SYSLOG:NOTICE:LOCAL1
       admin_server = SYSLOG:WARNING:LOCAL1

      [libdefaults]
       dns_lookup_realm = false
       dns_lookup_kdc = false
       ticket_lifetime = 24h
       renew_lifetime = 7d
       forwardable = true
       allow_weak_crypto = false
       clockskew = 300
       rdns = false

      [realms]

      [domain_realm]

      [appdefaults]
       pam = {
        debug = false
        ticket_lifetime = 36000
        renew_lifetime = 36000
        forwardable = true
        krb4_convert = false
       }

      [dbmodules]


      """
      trim: true
    .promise()


  they 'merge content (default FreeIPA file)', ({ssh}) ->
    nikita
      ssh: ssh
    .file.types.krb5_conf
      target: "#{scratch}/krb5.cnf"
      content:
        'libdefaults':
          'default_realm': 'AU.ADALTAS.CLOUD'
          'dns_lookup_realm': false
          'dns_lookup_kdc': false
          'rdns': false
          'dns_canonicalize_hostname': false
          'ticket_lifetime': '24h'
          'forwardable': true
          'udp_preference_limit': 0
          'default_ccache_name': 'KEYRING:persistent:%{uid}'
        'domain_realm': {}
    .file.types.krb5_conf
      target: "#{scratch}/krb5.cnf"
      content:
        'libdefaults':
          'default_ccache_name': 'FILE:/tmp/krb5cc_%{uid}'
      merge: true
    , (err, {status}) ->
      status.should.be.true() unless err
    .file.types.krb5_conf
      target: "#{scratch}/krb5.cnf"
      content:
        'libdefaults':
          'default_ccache_name': 'FILE:/tmp/krb5cc_%{uid}'
      merge: true
    , (err, {status}) ->
      status.should.be.false() unless err
    .file.assert
      target: "#{scratch}/krb5.cnf"
      content: """
      [libdefaults]
       default_realm = AU.ADALTAS.CLOUD
       dns_lookup_realm = false
       dns_lookup_kdc = false
       rdns = false
       dns_canonicalize_hostname = false
       ticket_lifetime = 24h
       forwardable = true
       udp_preference_limit = 0
       default_ccache_name = FILE:/tmp/krb5cc_%{uid}

      [domain_realm]

      """
      trim: true
    .promise()