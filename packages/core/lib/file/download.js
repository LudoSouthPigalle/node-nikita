// Generated by CoffeeScript 2.3.2
  // # `nikita.file.download`

  // Download files using various protocols.

  // In local mode (with an SSH connection), the `http` protocol is handled with the
  // "request" module when executed locally, the `ftp` protocol is handled with the
  // "jsftp" and the `file` protocol is handle with the native `fs` module.

  // The behavior of download may be confusing wether you are running over SSH or
  // not. It's philosophy mostly rely on the target point of view. When download
  // run, the target is local, compared to the upload function where target
  // is remote.

  // A checksum may provided with the option "sha256", "sha1" or "md5" to validate the uploaded
  // file signature.

  // Caching is active if "cache_dir" or "cache_file" are defined to anything but false.
  // If cache_dir is not a string, default value is './'
  // If cache_file is not a string, default is source basename.

  // Nikita resolve the path from "cache_dir" to "cache_file", so if cache_file is an
  // absolute path, "cache_dir" will be ignored

  // If no cache is used, signature validation is only active if a checksum is
  // provided.

  // If cache is used, signature validation is always active, and md5sum is automatically
  // calculated if neither sha256, sh1 nor md5 is provided.

  // ## Options

  // * `cache` (boolean, optional)   
  //   Activate the cache, default to true if either "cache_dir" or "cache_file" is
  //   activated.
  // * `cache_dir` (string, optional)   
  //   Path of the cache directory.
  // * `cache_file` (string|boolean, optional)   
  //   Cache the file on the executing machine, equivalent to cache unless an ssh
  //   connection is provided. If a string is provided, it will be the cache path.
  //   By default: basename of source
  // * `cookies` (array)   
  //   Extra cookies to include in the request when sending HTTP to a server.
  // * `force` (boolean)   
  //   Overwrite target file if it exists.
  // * `force_cache` (boolean)   
  //   Force cache overwrite if it exists
  // * `gid` (number|string, optional)   
  //   Group name or id who owns the target file.
  // * `http_headers` (array)   
  //   Extra  header  to include in the request when sending HTTP to a server.
  // * `location` (boolean)   
  //   If the server reports that the requested page has moved to a different
  //   location (indicated with a Location: header and a 3XX response code), this
  //   option will make curl redo the request on the new place.
  // * `md5` (MD5 Hash)   
  //   Hash of the file using MD5. Used to check integrity
  // * `mode` (octal mode)   
  //   Permissions of the target. If specified, nikita will chmod after download.
  // * `proxy` (string)   
  //   Use the specified HTTP proxy. If the port number is not specified, it is
  //   assumed at port 1080. See curl(1) man page.
  // * `sha1` (SHA-1 Hash)   
  //   Hash of the file using SHA-1. Used to check integrity.
  // * `sha256` (SHA-256 Hash)   
  //   Hash of the file using SHA-256. Used to check integrity.
  // * `source` (path)   
  //   File, HTTP URL, GIT repository. File is the default protocol if source
  //   is provided without any.
  // * `target` (path)   
  //   Path where to write the destination file.
  // * `uid` (number|string, optional)   
  //   User name or id who owns the target file.

  // ## Callback parameters

  // * `err` (Error)   
  //   Error object if any.
  // * `output.status` (boolean)   
  //   Value is "true" if file was downloaded.

  // ## File example

  // ```js
  // require('nikita')
  // .download({
  //   source: 'file://path/to/something',
  //   target: 'node-sigar.tgz'
  // }, function(err, {status}){
  //   console.info(err ? err.message : 'File downloaded ' + status)
  // })
  // ```

  // ## HTTP example

  // ```javascript
  // require('nikita')
  // .file.download({
  //   source: 'https://github.com/wdavidw/node-nikita/tarball/v0.0.1',
  //   target: 'node-sigar.tgz'
  // }, (err, {status}) => {
  //   console.info(err ? err.message : 'File downloaded ' + status)
  // })
  // ```

  // ## TODO

  // It would be nice to support alternatives sources such as FTP(S) or SFTP.

  // ## Source Code
var curl, fs, misc, path, url,
  indexOf = [].indexOf;

module.exports = function({options}) {
  var algo, p, protocols_ftp, protocols_http, ref, ref1, ref2, source_hash, source_url, ssh, stageDestination;
  this.log({
    message: 'Entering file.download',
    level: 'DEBUG',
    module: 'nikita/lib/file/download'
  });
  // SSH connection
  ssh = this.ssh(options.ssh);
  p = ssh ? path.posix : path;
  if (!options.source) {
    // Options
    throw Error(`Missing source: ${options.source}`);
  }
  if (!options.target) {
    throw Error(`Missing target: ${options.target}`);
  }
  if (/^file:\/\//.test(options.source)) {
    options.source = options.source.substr(7);
  }
  stageDestination = null;
  if (options.md5 != null) {
    if ((ref = typeof options.md5) !== 'string' && ref !== 'boolean') {
      throw Error(`Invalid MD5 Hash:${options.md5}`);
    }
    algo = 'md5';
    source_hash = options.md5;
  } else if (options.sha1 != null) {
    if ((ref1 = typeof options.sha1) !== 'string' && ref1 !== 'boolean') {
      throw Error(`Invalid SHA-1 Hash:${options.sha1}`);
    }
    algo = 'sha1';
    source_hash = options.sha1;
  } else if (options.sha256 != null) {
    if ((ref2 = typeof options.sha256) !== 'string' && ref2 !== 'boolean') {
      throw Error(`Invalid SHA-256 Hash:${options.sha256}`);
    }
    algo = 'sha256';
    source_hash = options.sha256;
  } else {
    algo = 'md5';
  }
  protocols_http = ['http:', 'https:'];
  protocols_ftp = ['ftp:', 'ftps:'];
  if (options.force) {
    this.log({
      message: `Using force: ${JSON.stringify(options.force)}`,
      level: 'DEBUG',
      module: 'nikita/lib/file/download'
    });
  }
  source_url = url.parse(options.source);
  if ((options.cache == null) && source_url.protocol === null) {
    // Disable caching if source is a local file and cache isnt exlicitly set by user
    options.cache = false;
  }
  if (options.cache == null) {
    options.cache = !!(options.cache_dir || options.cache_file);
  }
  if (options.http_headers == null) {
    options.http_headers = [];
  }
  if (options.cookies == null) {
    options.cookies = [];
  }
  // Normalization
  options.target = options.cwd ? p.resolve(options.cwd, options.target) : p.normalize(options.target);
  if (ssh && !p.isAbsolute(options.target)) {
    throw Error(`Non Absolute Path: target is ${JSON.stringify(options.target)}, SSH requires absolute paths, you must provide an absolute path in the target or the cwd option`);
  }
  // Shortcircuit accelerator:
  // If we know the source signature and if the target file exists
  // we compare it with the target file signature and stop if they match
  this.call({
    if: typeof source_hash === 'string',
    shy: true
  }, function(_, callback) {
    this.log({
      message: "Shortcircuit check if provided hash match target",
      level: 'WARN',
      module: 'nikita/lib/file/download'
    });
    return this.file.hash(options.target, {
      algo: algo
    }, function(err, {hash}) {
      if ((err != null ? err.code : void 0) === 'ENOENT') {
        err = null;
      }
      return callback(err, source_hash === hash);
    });
  }, function(err, {status}) {
    if (!status) {
      return;
    }
    this.log({
      message: "Destination with valid signature, download aborted",
      level: 'INFO',
      module: 'nikita/lib/file/download'
    });
    return this.end();
  });
  // Download the file and place it inside local cache
  // Overwrite the options.source and source_url properties to make them
  // look like a local file instead of an HTTP URL
  this.file.cache({
    if: options.cache,
    // Local file must be readable by the current process
    ssh: false,
    sudo: false,
    source: options.source,
    cache_dir: options.cache_dir,
    cache_file: options.cache_file,
    http_headers: options.http_headers,
    cookies: options.cookies,
    md5: options.md5,
    proxy: options.proxy,
    location: options.location
  }, function(err, {status, target}) {
    if (err) {
      throw err;
    }
    if (options.cache) {
      options.source = target;
    }
    return source_url = url.parse(options.source);
  });
  // TODO
  // The current implementation seems inefficient. By modifying stageDestination,
  // we download the file, check the hash, and again treat it the HTTP URL 
  // as a local file and check hash again.
  this.fs.stat({
    target: options.target,
    relax: true
  }, function(err, {stats}) {
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
    if (!err && misc.stats.isDirectory(stats.mode)) {
      this.log({
        message: "Destination is a directory",
        level: 'DEBUG',
        module: 'nikita/lib/file/download'
      });
      options.target = path.join(options.target, path.basename(options.source));
    }
    return stageDestination = `${options.target}.${Date.now()}${Math.round(Math.random() * 1000)}`;
  });
  this.call({
    if: function() {
      var ref3;
      return ref3 = source_url.protocol, indexOf.call(protocols_http, ref3) >= 0;
    }
  }, function() {
    var cookie, hash_source, hash_target, header;
    this.log({
      message: "HTTP Download",
      level: 'DEBUG',
      module: 'nikita/lib/file/download'
    });
    this.log({
      message: "Download file from url using curl",
      level: 'INFO',
      module: 'nikita/lib/file/download'
    });
    // Ensure target directory exists
    this.system.mkdir({
      shy: true,
      target: path.dirname(stageDestination)
    });
    // Download the file
    this.system.execute({
      cmd: [
        'curl',
        options.fail ? '--fail' : void 0,
        source_url.protocol === 'https:' ? '--insecure' : void 0,
        options.location ? '--location' : void 0,
        ...((function() {
          var i,
        len,
        ref3,
        results;
          ref3 = options.http_headers;
          results = [];
          for (i = 0, len = ref3.length; i < len; i++) {
            header = ref3[i];
            results.push(`--header '${header.replace('\'',
        '\\\'')}'`);
          }
          return results;
        })()),
        ...((function() {
          var i,
        len,
        ref3,
        results;
          ref3 = options.cookies;
          results = [];
          for (i = 0, len = ref3.length; i < len; i++) {
            cookie = ref3[i];
            results.push(`--cookie '${cookie.replace('\'',
        '\\\'')}'`);
          }
          return results;
        })()),
        `-s ${options.source}`,
        `-o ${stageDestination}`,
        options.proxy ? `-x ${options.proxy}` : void 0
      ].join(' '),
      shy: true
    });
    hash_source = hash_target = null;
    this.file.hash(stageDestination, {
      algo: algo
    }, function(err, {hash}) {
      if (err) {
        throw err;
      }
      // Hash validation
      // Probably not the best to check hash, it only applies to HTTP for now
      if (typeof source_hash === 'string' && source_hash !== hash) {
        if (source_hash !== hash) {
          throw Error(`Invalid downloaded checksum, found '${hash}' instead of '${source_hash}'`);
        }
      }
      return hash_source = hash;
    });
    this.file.hash(options.target, {
      algo: algo,
      relax: true
    }, function(err, {hash}) {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
      return hash_target = hash;
    });
    this.call(function({}, callback) {
      var match;
      match = hash_source === hash_target;
      this.log(match ? {
        message: `Hash matches as '${hash_source}'`,
        level: 'INFO',
        module: 'nikita/lib/file/download'
      } : {
        message: `Hash dont match, source is '${hash_source}' and target is '${hash_target}'`,
        level: 'WARN',
        module: 'nikita/lib/file/download'
      });
      return callback(null, !match);
    });
    return this.system.remove({
      unless: function() {
        return this.status(-1);
      },
      shy: true,
      target: stageDestination
    });
  });
  this.call({
    if: function() {
      var ref3;
      return (ref3 = source_url.protocol, indexOf.call(protocols_http, ref3) < 0) && !ssh;
    }
  }, function() {
    var hash_source, hash_target;
    this.log({
      message: "File Download without ssh (with or without cache)",
      level: 'DEBUG',
      module: 'nikita/lib/file/download'
    });
    hash_source = hash_target = null;
    this.file.hash({
      target: options.source,
      algo: algo
    }, function(err, {hash}) {
      if (err) {
        throw err;
      }
      return hash_source = hash;
    });
    this.file.hash({
      target: options.target,
      algo: algo,
      if_exists: true
    }, function(err, {hash}) {
      if (err) {
        throw err;
      }
      return hash_target = hash;
    });
    this.call(function({}, callback) {
      var match;
      match = hash_source === hash_target;
      this.log(match ? {
        message: `Hash matches as '${hash_source}'`,
        level: 'INFO',
        module: 'nikita/lib/file/download'
      } : {
        message: `Hash dont match, source is '${hash_source}' and target is '${hash_target}'`,
        level: 'WARN',
        module: 'nikita/lib/file/download'
      });
      return callback(null, !match);
    });
    this.system.mkdir({
      if: function() {
        return this.status(-1);
      },
      shy: true,
      target: path.dirname(stageDestination)
    });
    return this.fs.copy({
      if: function() {
        return this.status(-2);
      },
      source: options.source,
      target: stageDestination
    });
  });
  this.call({
    if: function() {
      var ref3;
      return (ref3 = source_url.protocol, indexOf.call(protocols_http, ref3) < 0) && ssh;
    }
  }, function() {
    var hash_source, hash_target;
    this.log({
      message: "File Download with ssh (with or without cache)",
      level: 'DEBUG',
      module: 'nikita/lib/file/download'
    });
    hash_source = hash_target = null;
    this.file.hash({
      target: options.source,
      algo: algo,
      ssh: false,
      sudo: false
    }, function(err, {hash}) {
      if (err) {
        throw err;
      }
      return hash_source = hash;
    });
    this.file.hash({
      target: options.target,
      algo: algo,
      if_exists: true
    }, function(err, {hash}) {
      if (err) {
        throw err;
      }
      return hash_target = hash;
    });
    this.call(function({}, callback) {
      var match;
      match = hash_source === hash_target;
      this.log(match ? {
        message: `Hash matches as '${hash_source}'`,
        level: 'INFO',
        module: 'nikita/lib/file/download'
      } : {
        message: `Hash dont match, source is '${hash_source}' and target is '${hash_target}'`,
        level: 'WARN',
        module: 'nikita/lib/file/download'
      });
      return callback(null, !match);
    });
    this.system.mkdir({
      if: function() {
        return this.status(-1);
      },
      shy: true,
      target: path.dirname(stageDestination)
    });
    return this.fs.createWriteStream({
      if: function() {
        return this.status(-2);
      },
      target: stageDestination,
      stream: function(ws) {
        var rs;
        rs = fs.createReadStream(options.source);
        return rs.pipe(ws);
      }
    }, function(err) {
      return this.log(err ? {
        message: `Downloaded local source ${JSON.stringify(options.source)} to remote target ${JSON.stringify(stageDestination)} failed`,
        level: 'ERROR',
        module: 'nikita/lib/file/download'
      } : {
        message: `Downloaded local source ${JSON.stringify(options.source)} to remote target ${JSON.stringify(stageDestination)}`,
        level: 'INFO',
        module: 'nikita/lib/file/download'
      });
    });
  });
  return this.call(function() {
    this.log({
      message: "Unstage downloaded file",
      level: 'DEBUG',
      module: 'nikita/lib/file/download'
    });
    this.system.move({
      if: this.status(),
      source: stageDestination,
      target: options.target
    });
    this.system.chmod({
      if: options.mode != null,
      target: options.target,
      mode: options.mode
    });
    return this.system.chown({
      if: (options.uid != null) || (options.gid != null),
      target: options.target,
      uid: options.uid,
      gid: options.gid
    });
  });
};

// ## Module Dependencies
fs = require('fs');

path = require('path').posix; // need to detect ssh connection

url = require('url');

misc = require('../misc');

curl = require('../misc/curl');
