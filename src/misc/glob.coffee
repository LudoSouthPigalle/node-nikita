
path = require 'path'
glob = require 'glob'
{Minimatch} = require 'minimatch'
exec = require 'ssh2-exec'

getprefix = (pattern) ->
  prefix = null
  n = 0
  while typeof pattern[n] is "string" then n++
  # now n is the index of the first one that is *not* a string.
  # see if there's anything else
  switch n
    # if not, then this is rather simple
    when pattern.length
      prefix = pattern.join '/'
      # fs.stat ssh, prefix, (err, stat) ->
      #   # either it's there, or it isn't.
      #   # nothing more to do, either way.
      #   if exists
      #     if prefix and isAbsolute(prefix) and !@nomount
      #       if prefix.charAt(0) is "/"
      #         prefix = path.join @root, prefix
      #       else
      #         prefix = path.resolve @root, prefix
      #     if process.platform is "win32"
      #       prefix = prefix.replace(/\\/g, "/")
      return prefix
    when 0
      # pattern *starts* with some non-trivial item.
      # going to readdir(cwd), but not include the prefix in matches.
      return null
    else
      # pattern has some string bits in the front.
      # whatever it starts with, whether that's "absolute" like /foo/bar,
      # or "relative" like "../baz"
      prefix = pattern.slice 0, n
      prefix = prefix.join '/'
      return prefix

###
Important: for now, only the "dot" options has been tested.
###

module.exports = (ssh, pattern, options, callback) ->
  if arguments.length is 3
    callback = options
    options = {}
  if ssh
    pattern = path.normalize pattern
    minimatch = new Minimatch pattern, options
    cmd = "find"
    for s in minimatch.set
      prefix = getprefix s
      cmd += " -f #{prefix}"
    exec ssh, cmd, (err, stdout) ->
      return callback null, [] if err
      files = stdout.trim().split /\r\n|[\n\r\u0085\u2028\u2029]/g
      files = files.filter (file) -> minimatch.match file
      for s in minimatch.set
        n = 0
        while typeof s[n] is "string" then n++
        if s[n] is Minimatch.GLOBSTAR
          prefix = getprefix s
          files.unshift prefix if prefix
      callback err, files
  else
    glob "#{pattern}", options, (err, files) ->
      callback err, files