
{merge} = require 'mixme'
utils = require '../utils'
session = require '../session'

###
Pass an SSH connection or SSH information to an action. Disable SSH if the value
is `null` or `false`.
###

module.exports =
  name: '@nikitajs/core/src/plugins/ssh'
  require: [
    '@nikitajs/core/src/plugins/tools_find'
  ]
  hooks:
    'nikita:session:normalize': (action, handler) ->
      # Dont interfere with ssh actions
      return handler if action.metadata.namespace[0] is 'ssh'
      if action.hasOwnProperty 'ssh'
        ssh = action.ssh
        delete action.ssh
      ->
        action = await handler.call null, ...arguments
        action.ssh = ssh
        action
    'nikita:session:action': (action) ->
      # return handler if action.metadata.namespace[0] is 'ssh'
      ssh = await action.tools.find (action) ->
        return undefined if action.ssh is undefined
        action.ssh or false
      if ssh and not utils.ssh.is ssh
        {ssh} = await session
          # Need to inject `tools.log`
          plugins: [
            require '../plugins/tools_events'
            require '../plugins/tools_log'
            require '../metadata/status'
            require '../plugins/history'
          ]
        , ({run}) -> run
          metadata:
            namespace: ['ssh', 'open']
          config: ssh
        action.metadata.ssh_dispose = true
      else if ssh is false
        ssh = null
      action.ssh = ssh
    'nikita:session:result': ({action}) ->
      if action.metadata.ssh_dispose
        await session
          # Need to inject `tools.log`
          plugins: [
            require '../plugins/tools_events'
            require '../plugins/tools_log'
            require '../metadata/status'
            require '../plugins/history'
          ]
        , ({run}) -> run
          metadata:
            namespace: ['ssh', 'close']
          config: ssh: action.ssh
