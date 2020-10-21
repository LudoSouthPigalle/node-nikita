// Generated by CoffeeScript 2.5.1
// `nikita.file.types.yum_repo`

// Yum is a packet manager for centos/redhat. It uses .repo file located in 
// "/etc/yum.repos.d/" directory to configure the list of available mirrors.

// ## Schema
var handler, path, schema, utils;

schema = {
  type: 'object',
  required: ['target']
};

// This action honors all the options from "nikita.file.ini".

// ## Handler
handler = function({config}) {
  //log message: "Entering file.types.yum_repo", level: 'DEBUG', module: 'nikita/lib/file/types/yum_repo'
  // Set the target directory to yum's default path if target is a file name
  config.target = path.resolve('/etc/yum.repos.d', config.target);
  return this.file.ini({
    parse: utils.ini.parse_multi_brackets,
    escape: false
  }, config);
};

// ## Exports
module.exports = {
  handler: handler,
  schema: schema
};

// ## Dependencies
path = require('path');

utils = require('../utils');
