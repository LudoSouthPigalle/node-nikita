// Generated by CoffeeScript 2.5.1
// # `nikita.network.http`

// Perform an HTTP request. Internaly, the action requires the presence of the
// `curl` command.

// ## Return

// * `output.data` (string)   
//   The decoded data is type is provided or detected.
// * `output.body` (string)   
//   The HTTP response body.
// * `output.headers` ([string])   
//   The HTTP response headers.
// * `output.http_version` ([string])   
//   The HTTP response http_version, eg 'HTTP/1.1'.
// * `output.status_code` (string)   
//   The HTTP response status code.
// * `output.status_message` (string)   
//   The HTTP response status message.
// * `output.type` (string)   
//   The format type if provided or detected, possible values is only "json" for now.

// ## Error

// The `error.code` reflects the native `curl` errors code. You can get a list of
// them with `man 3 libcurl-errors`. For example:

// ```js
// try
//   nikita.network.http({
//     ssh: ssh,
//     url: "http://2222:localhost"
//   })
// } catch (err) {
//   assert(err.code, 'CURLE_URL_MALFORMAT')
//   assert(err.message, 'CURLE_URL_MALFORMAT: the curl command exited with code `3`.')
// }
// ```

// ## Schema
var handler, schema, url, utils;

schema = {
  type: 'object',
  properties: {
    'cookies': {
      type: 'array',
      items: {
        type: 'string'
      },
      description: `Extra cookies to include in the request when sending HTTP to a server.`
    },
    'data': {
      type: ['array', 'boolean', 'null', 'number', 'object', 'string'],
      description: `The request HTTP body associated with "POST" and "PUT" requests. The
\`Accept: application/json\` request header will be automatically
inserted if not yet present and if \`data\` is not a string.`
    },
    'fail': {
      type: 'boolean',
      description: `Fail silently (no output at all) on HTTP errors.`
    },
    'gid': {
      $ref: 'module://@nikitajs/core/lib/actions/fs/chown#/properties/gid',
      description: `Group name or id who owns the target file; only apply if \`target\` is
provided.`
    },
    'http_headers': {
      type: 'object',
      default: {},
      description: `Extra header to include in the request when sending the HTTP request
to a server.`
    },
    'insecure': {
      type: 'boolean',
      description: `Allow insecure server connections when using SSL; disabled if \`cacert\`
is provided.`
    },
    'location': {
      type: 'boolean',
      description: `If the server reports that the requested page has moved to a different
location (indicated with a Location: header and a 3XX response code),
this option will make curl redo the request on the new place.`
    },
    'method': {
      type: 'string',
      default: 'GET',
      description: `Specify request command (HTTP method) to use.`
    },
    'mode': {
      $ref: 'module://@nikitajs/core/lib/actions/fs/chmod#/properties/mode',
      description: `Permissions of the target. If specified, nikita will chmod after
download.`
    },
    'negotiate': {
      type: 'boolean',
      description: `Use HTTP Negotiate (SPNEGO) authentication.`
    },
    'proxy': {
      type: 'string',
      description: `Use the specified HTTP proxy. If the port number is not specified, it
is assumed at port 1080. See curl(1) man page.`
    },
    'password': {
      type: 'string',
      description: `Password associated with the Kerberos principal, required if
\`principal\` is provided.`
    },
    'principal': {
      type: 'string',
      description: `Kerberos principal name if a ticket must be generated along the
\`negociate\` option.`
    },
    'referer': {
      type: 'string',
      description: `An alias for connection.http_headers[\'Referer\']`
    },
    'target': {
      type: 'string',
      description: `Write to file instead of stdout; mapped to the curl \`output\` argument.`
    },
    'uid': {
      $ref: 'module://@nikitajs/core/lib/actions/fs/chown#/properties/uid',
      description: `User name or id who owns the target file; only apply if \`target\` is
provided.`
    },
    'url': {
      type: 'string',
      description: `HTTP URL endpoint, must be a valid URL.`
    }
  },
  required: ['url']
};

// ## Handler
handler = async function({config}) {
  var base, base1, code, cookie, done_with_header, err, header, http_version, i, j, just_finished_header, len, line, name, output, ref, ref1, status_code, status_message, stdout, url_info, value;
  if (config.principal && !config.password) {
    throw Error("Required Option: `password` is required if principal is provided");
  }
  if (((ref = config.method) === 'POST' || ref === 'PUT') && !config.data) {
    throw Error("Required Option: `data` is required with POST and PUT requests");
  }
  if ((config.data != null) && typeof config.data !== 'string') {
    if ((base = config.http_headers)['Accept'] == null) {
      base['Accept'] = 'application/json';
    }
    if ((base1 = config.http_headers)['Content-Type'] == null) {
      base1['Content-Type'] = 'application/json';
    }
    config.data = JSON.stringify(config.data);
  }
  url_info = url.parse(config.url);
  if (config.http_headers == null) {
    config.http_headers = [];
  }
  if (config.cookies == null) {
    config.cookies = [];
  }
  err = null;
  output = {
    body: [],
    data: void 0,
    http_version: void 0,
    headers: {},
    status_code: void 0,
    status_message: void 0,
    type: void 0
  };
  try {
    ({code, stdout} = (await this.execute({
      command: `${!config.principal ? '' : ['echo', config.password, '|', 'kinit', config.principal, '>/dev/null'].join(' ')}
command -v curl >/dev/null || exit 90
${[
        'curl',
        '--include', // Include protocol headers in the output (H/F)
        '--silent', // Dont print progression to stderr
        config.fail ? '--fail' : void 0,
        !config.cacert && url_info.protocol === 'https:' ? '--insecure' : void 0,
        config.cacert ? '--cacert #{config.cacert}' : void 0,
        config.negotiate ? '--negotiate -u:' : void 0,
        config.location ? '--location' : void 0,
        ...((function() {
          var ref1,
        results;
          ref1 = config.http_headers;
          results = [];
          for (header in ref1) {
            value = ref1[header];
            results.push(`--header '${header.replace('\'',
        '\\\'')}:${value.replace('\'',
        '\\\'')}'`);
          }
          return results;
        })()),
        ...((function() {
          var j,
        len,
        ref1,
        results;
          ref1 = config.cookies;
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            cookie = ref1[j];
            results.push(`--cookie '${cookie.replace('\'',
        '\\\'')}'`);
          }
          return results;
        })()),
        config.target ? `-o ${config.target}` : void 0,
        config.proxy ? `-x ${config.proxy}` : void 0,
        config.method !== 'GET' ? `-X ${config.method}` : void 0,
        config.data ? `--data ${utils.string.escapeshellarg(config.data)}` : void 0,
        `${config.url}`
      ].join(' ')}`,
      trap: true
    })));
    output.raw = stdout;
    done_with_header = false;
    ref1 = utils.string.lines(stdout);
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      line = ref1[i];
      if (output.body.length === 0 && /^HTTP\/[\d.]+ \d+/.test(line)) {
        done_with_header = false;
        output.headers = {};
        [http_version, status_code, ...status_message] = line.split(' ');
        output.http_version = http_version.substr(5);
        output.status_code = parseInt(status_code, 10);
        output.status_message = status_message.join(' ');
        just_finished_header = false;
        continue;
      } else if (line === '') {
        done_with_header = true;
        continue;
      }
      if (!done_with_header) {
        [name, ...value] = line.split(':');
        output.headers[name.trim()] = value.join(':').trim();
      } else {
        output.body.push(line);
      }
    }
  } catch (error) {
    err = error;
    if (code = utils.curl.error(err.exit_code)) {
      throw utils.error(code, [`the curl command exited with code \`${err.exit_code}\`.`]);
    } else if (err.exit_code === 90) {
      throw utils.error('NIKITA_NETWORK_DOWNLOAD_CURL_REQUIRED', ['the `curl` command could not be found', 'and is required to perform HTTP requests,', 'make sure it is available in your `$PATH`.']);
    } else {
      throw err;
    }
  }
  await this.fs.chmod({
    if: config.target && config.mode,
    mode: config.mode
  });
  await this.fs.chown({
    if: config.target && (config.uid != null) || (config.gid != null),
    target: config.target,
    uid: config.uid,
    gid: config.gid
  });
  if (/^application\/json(;|$)/.test(output.headers['Content-Type'])) {
    output.type = 'json';
  }
  output.body = output.body.join('');
  switch (output.type) {
    case 'json':
      output.data = JSON.parse(output.body);
  }
  return output;
};

// # Export
module.exports = {
  handler: handler,
  metadata: {
    schema: schema
  }
};

// ## Dependencies
url = require('url');

utils = require('../utils');
