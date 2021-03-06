
# `nikita.lxd.cluster`

Create a cluster of LXD instances.

## Example

```yaml
networks:
  lxdbr0public:
    ipv4.address: 172.16.0.1/24
    ipv4.nat: true
    ipv6.address: none
  lxdbr1private:
    ipv4.address: 10.10.10.1/24
    ipv4.nat: true
    ipv6.address: none
    dns.domain: nikita.local
containers:
  nikita
    image: images:centos/7
    properties:
      environment:
        MY_VAR: 'my value'
    disk:
      nikitadir:
        source: /nikita
        path: /nikita
    nic:
      eth0:
        container: eth0
        nictype: bridged
        parent: lxdbr0public
      eth1:
        container: eth1
        nictype: bridged
        parent: lxdbr1private
        ip: '10.10.10.10'
        netmask: '255.255.255.192'
    proxy:
      ssh:
        listen: 'tcp:0.0.0.0:2200'
        connect: 'tcp:127.0.0.1:22'
    ssh:
      enabled: true
      #id_rsa: assets/id_rsa
    user:
      nikita:
        sudo: true
        authorized_keys: assets/id_rsa.pub
    prevision: path/to/action
    provision: path/to/action
    provision_container: path/to/action
```

## Schema

    schema =
      type: 'object'
      properties:
        'containers':
          type: 'object'
          description: """
          Initialize a Linux Container with given image name, container name and
          config.
          """
          patternProperties: '(^[a-zA-Z][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9](?!\-)$)|(^[a-zA-Z]$)':
            type: 'object'
            properties:
              'properties':
                $ref: 'module://@nikitajs/lxd/src/config/set#/properties/properties'
              'disk':
                type: 'object'
                default: {}
                patternProperties: '.*': # Device name of disk
                  $ref: 'module://@nikitajs/lxd/src/config/device#/definitions/disk/properties/properties'
              'image':
                $ref: 'module://@nikitajs/lxd/src/init#/properties/image'
              'nic':
                type: 'object'
                default: {}
                patternProperties: '.*':
                  type: 'object'
                  allOf: [
                    properties:
                      'ip':
                        type: 'string'
                        format: 'ipv4'
                      'netmask':
                        type: 'string'
                        default: '255.255.255.0'
                        format: 'ipv4'
                  ,
                    $ref: 'module://@nikitajs/lxd/src/config/device#/definitions/nic/properties/properties'
                  ]
              'proxy':
                type: 'object'
                default: {}
                patternProperties: '.*':
                  $ref: 'module://@nikitajs/lxd/src/config/device#/properties/properties'
              'user':
                type: 'object'
                default: {}
                patternProperties: '.*':
                  type: 'object'
                  properties:
                    'sudo':
                      type: 'boolean'
                      default: false
                      description: """
                      Enable sudo access for the user.
                      """
                    'authorized_keys':
                      type: 'string'
                      description: """
                      Path to file with SSH public key to be added to
                      authorized_keys file.
                      """
              'ssh':
                type: 'object'
                default: {}
                properties:
                  'enabled':
                    type: 'boolean'
                    default: false
                    description: """
                    Enable SSH connection.
                    """
            required: ['image']
        'networks':
          type: 'object'
          default: {}
          patternProperties: '.*':
            $ref: 'module://@nikitajs/lxd/src/network#/properties/properties'
        'prevision':
          typeof: 'function'
        'provision':
          typeof: 'function'
        'provision_container':
          typeof: 'function'
      # required: ['containers']

## Handler

    handler = ({config}) ->
      # Prevision
      if !!config.prevision
        await @call config, config.prevision
      # Create a network
      for networkName, networkProperties of config.networks
        await @lxd.network
          metadata:
            header: "Network #{networkName}"
          config:
            network: networkName
            properties: networkProperties
      # Init containers
      for containerName, containerConfig of config.containers then await @call
        metadata:
          header: "Container #{containerName}"
      , ->
        # Set configuration
        await @lxd.init
          metadata:
            header: 'Init'
          config:
            container: containerName
            image: containerConfig.image
        # Set config
        if containerConfig?.properties
          await @lxd.config.set
            metadata:
              header: 'Properties'
            config:
              container: containerName
              properties: containerConfig.properties
        # Create disk device
        for deviceName, configDisk of containerConfig.disk
          await @lxd.config.device
            metadata:
              header: "Device #{deviceName} disk"
            config:
              container: containerName
              device: deviceName
              type: 'disk'
              properties: configDisk
        # Create nic device
        for deviceName, configNic of containerConfig.nic
          # note: `confignic.config.parent` is not required for each type
          # throw Error "Required Property: nic.#{device}.parent" unless confignic.config.parent
          await @lxd.config.device
            metadata:
              header: "Device #{deviceName} nic"
            config:
              container: containerName
              device: deviceName
              type: 'nic'
              properties: utils.object.filter configNic, ['ip', 'netmask']
          if configNic.ip
            await @lxd.file.push
              metadata:
                header: "ifcfg #{deviceName}"
              config:
                container: containerName
                target: "/etc/sysconfig/network-scripts/ifcfg-#{deviceName}"
                content: """
                NM_CONTROLLED=yes
                BOOTPROTO=none
                ONBOOT=yes
                IPADDR=#{configNic.ip}
                NETMASK=#{configNic.netmask}
                DEVICE=#{deviceName}
                PEERDNS=no
                """
        # Create proxy device
        for deviceName, configProxy of containerConfig.proxy
          # todo: add host detection and port forwarding to VirtualBox
          # VBoxManage controlvm 'lxd' natpf1 'ipa_ui,tcp,0.0.0.0,2443,,2443'
          await @lxd.config.device
            metadata:
              header: "Device #{deviceName} proxy"
            config:
              container: containerName
              device: deviceName
              type: 'proxy'
              properties: configProxy
        # Start container
        await @lxd.start
          metadata:
            header: 'Start'
          container: containerName
        # Wait until container is running
        await @execute.wait
          command: "lxc info #{containerName} | grep 'Status: Running'"
        await @network.tcp.wait
          host: 'linuxfoundation.org'
          port: 80
          # timeout: 5000
        # Not sure why openssl is required
        await @lxd.exec
          metadata:
            header: 'OpenSSL'
            retry: 10
            sleep: 5000
          container: containerName
          command: """
          #yum update -y
          yum install -y openssl
          command -v openssl
          """
          trap: true
        # Enable SSH
        if containerConfig.ssh?.enabled
          await @lxd.exec
            metadata:
              header: 'SSH'
            container: containerName
            command: """
            # systemctl status sshd
            # yum install -y openssh-server
            # systemctl start sshd
            # systemctl enable sshd
            systemctl status sshd && exit 42
            if command -v yum >/dev/null 2>&1; then
              yum -y install openssh-server
            elif command -v apt-get >/dev/null 2>&1; then
              apt-get -y install openssh-server
            else
              echo "Unsupported Package Manager" >&2 && exit 2
            fi
            systemctl status sshd && exit 42
            systemctl start sshd
            systemctl enable sshd
            """
            trap: true
            code_skipped: 42
        # Create users
        for userName, configUser of containerConfig.user then await @call
          metadata:
            header: "User #{userName}"
        , ->
          await @lxd.exec
            metadata:
              header: 'Create'
            container: containerName
            command: """
            id #{userName} && exit 42
            useradd --create-home --system #{userName}
            mkdir -p /home/#{userName}/.ssh
            chown #{userName}.#{userName} /home/#{userName}/.ssh
            chmod 700 /home/#{userName}/.ssh
            """
            trap: true
            code_skipped: 42
          # Enable sudo access
          await @lxd.exec
            if: configUser.sudo
            metadata:
              header: 'Sudo'
            container: containerName
            command: """
            yum install -y sudo
            command -v sudo
            cat /etc/sudoers | grep "#{userName}" && exit 42
            echo "#{userName} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
            """
            trap: true
            code_skipped: 42
          # Add SSH public key to authorized_keys file
          await @lxd.file.push
            if: configUser.authorized_keys
            metadata:
              header: 'Authorize'
            container: containerName
            gid: "#{userName}"
            uid: "#{userName}"
            mode: 600
            source: "#{configUser.authorized_keys}"
            target: "/home/#{userName}/.ssh/authorized_keys"
      # Provision
      if !!config.provision
        await @call config, config.provision
      # Provision containers
      if !!config.provision_container
        for containerName, containerConfig of config.containers
          await @call
            container: containerName
            config: containerConfig
          , config.provision_container

## Export

    module.exports =
      handler: handler
      metadata:
        schema: schema

## Dependencies

    utils = require '../utils'
