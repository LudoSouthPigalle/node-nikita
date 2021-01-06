
# Registration of `nikita.ipa` actions

require '@nikitajs/network/lib/register'
registry = require '@nikitajs/engine/lib/registry'

module.exports =
  ipa:
    group:
      '': '@nikitajs/ipa/src/group'
      add_member: '@nikitajs/ipa/src/group/add_member'
      del: '@nikitajs/ipa/src/group/del'
      exists: '@nikitajs/ipa/src/group/exists'
      show: '@nikitajs/ipa/src/group/show'
    user:
      '': '@nikitajs/ipa/src/user'
      find: '@nikitajs/ipa/src/user/find'
      del: '@nikitajs/ipa/src/user/del'
      exists: '@nikitajs/ipa/src/user/exists'
      show: '@nikitajs/ipa/src/user/show'
    service:
      '': '@nikitajs/ipa/src/service'
      del: '@nikitajs/ipa/src/service/del'
      exists: '@nikitajs/ipa/src/service/exists'
      show: '@nikitajs/ipa/src/service/show'
(->
  try
    await registry.register module.exports
  catch err
    console.error err.stack
    process.exit(1)
)()
