
# `nikita.ldap.tools.database`

Return the database associated with a suffix.

## Example

```js
const {databases} = await nikita.ldap.tools.databases({
  uri: 'ldap://localhost',
  binddn: 'cn=admin,cn=config',
  passwd: 'config'
})
// Value is similar to `[ '{-1}frontend', '{0}config', '{1}mdb' ]`
databases.map( database => {
  console.info(`Database: ${database}`)
})
```

## Schema

    schema =
      type: 'object'
      allOf: [
        $ref: 'module://@nikitajs/ldap/src/search#/properties'
      ,
        properties:
          'suffix':
            type: 'string'
            description: """
            The suffix associated with the database.
            """
        required: ['suffix']
      ]

## Handler

    handler = ({config}) ->
      {stdout} = await @ldap.search config,
        base: 'cn=config'
        filter: "(olcSuffix= #{config.suffix})"
        attributes: ['dn']
      [_, dn] = stdout.split ':'
      dn = dn.trim()
      [_, database] = /^olcDatabase=(.*),/.exec dn
      dn: dn
      database: database

## Exports

    module.exports =
      handler: handler
      metadata:
        global: 'ldap'
        schema: schema

## Dependencies

    utils = require '../utils'
