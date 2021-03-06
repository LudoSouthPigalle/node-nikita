// Generated by CoffeeScript 2.5.1
// # `nikita.docker_rmi`

// Remove images. All container using image should be stopped to delete it unless
// force options is set.

// ## Output

// * `err`   
//   Error object if any.
// * `status`   
//   True if image was removed.

// ## Hook
var handler, on_action, schema;

on_action = function({config, metadata}) {
  if (metadata.argument != null) {
    return config.image = metadata.argument;
  }
};

// ## Schema
schema = {
  type: 'object',
  properties: {
    // ...docker.wrap_schema
    'cwd': {
      type: 'string',
      description: `Change the build working directory.`
    },
    'docker': {
      $ref: 'module://@nikitajs/docker/lib/tools/execute#/properties/docker'
    },
    'image': {
      type: 'string',
      description: `Name of the Docker image present in the registry.`
    },
    'no_prune': {
      type: 'boolean',
      description: `Do not delete untagged parents.`
    },
    'tag': {
      type: 'string',
      description: `Tag of the Docker image, default to latest.`
    }
  },
  required: ['image']
};

// ## Handler
handler = async function({config}) {
  await this.docker.tools.execute({
    command: ['images', `| grep '${config.image} '`, config.tag != null ? `| grep ' ${config.tag} '` : void 0].join(' '),
    code_skipped: [1]
  });
  return (await this.docker.tools.execute({
    command: [
      'rmi',
      ['force',
      'no_prune'].filter(function(opt) {
        return config[opt] != null;
      }).map(function(opt) {
        return ` --${opt.replace('_',
      '-')}`;
      }),
      ` ${config.image}`,
      config.tag != null ? `:${config.tag}` : void 0
    ].join(''),
    if: function({parent}) {
      return parent.parent.tools.status(-1);
    }
  }));
};

// ## Exports
module.exports = {
  handler: handler,
  hooks: {
    on_action: on_action
  },
  metadata: {
    global: 'docker',
    schema: schema
  }
};
