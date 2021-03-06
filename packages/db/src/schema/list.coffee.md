
# `nikita.db.schema.exists`

List the PostgreSQL schemas of a database.

## Create Schema example

```js
const {schemas} = await nikita.db.schema.list({
  admin_username: 'test',
  admin_password: 'test',
  database: 'my_db'
})
schemas.map( ({name, owner}) => {
  console.info(`Schema is ${name} and owner is ${owner}`)
})
```

## Schema

    schema =
      type: 'object'
      properties:
        'admin_username':
          $ref: 'module://@nikitajs/db/src/query#/properties/admin_username'
        'admin_password':
          $ref: 'module://@nikitajs/db/src/query#/properties/admin_password'
        'database':
          type: 'string'
          description: """
          The database name storing the schemas.
          """
        'core':
          $ref: 'module://@nikitajs/db/src/query#/properties/core'
        'host':
          $ref: 'module://@nikitajs/db/src/query#/properties/host'
        'port':
          $ref: 'module://@nikitajs/db/src/query#/properties/port'
      required: ['admin_username', 'admin_password', 'database', 'engine', 'host']

## Handler

    handler = ({config}) ->
      {stdout} = await @db.query config: config,
        command: '\\dn'
        trim: true
      schemas = utils.string
      .lines(stdout)
      .map (line) ->
        [name, owner] = line.split '|'
        name: name
        owner: owner
      schemas: schemas

## Exports

    module.exports =
      handler: handler
      metadata:
        argument_to_config: 'database'
        global: 'db'
        schema: schema
      
## Dependencies

    utils = require '@nikitajs/core/lib/utils'
