// Generated by CoffeeScript 2.5.1
var iptables, jsesc, merge, utils;

utils = require('@nikitajs/engine/lib/utils');

jsesc = require('jsesc');

({merge} = require('mixme'));

module.exports = iptables = {
  // add_properties: ['target', 'protocol', 'dport', 'in-interface', 'out-interface', 'source', 'target']
  add_properties: ['--protocol', '--source', '---target', '--jump', '--goto', '--in-interface', '--out-interface', '--fragment', 'tcp|--source-port', 'tcp|--sport', 'tcp|--target-port', 'tcp|--dport', 'tcp|--tcp-flags', 'tcp|--syn', 'tcp|--tcp-option', 'udp|--source-port', 'udp|--sport', 'udp|--target-port', 'udp|--dport'],
  // modify_properties: ['state', 'comment']
  modify_properties: [
    '--set-counters',
    '--log-level',
    '--log-prefix',
    '--log-tcp-sequence',
    '--log-tcp-options', // LOG
    '--log-ip-options',
    '--log-uid', // LOG
    'state|--state',
    'comment|--comment',
    'limit|--limit'
  ],
  commands_arguments: { // Used to compute rulenum
    '-A': ['chain'],
    '-D': ['chain'],
    '-I': ['chain'],
    '-R': ['chain'],
    '-N': ['chain'],
    '-X': ['chain'],
    '-P': ['chain', 'target'],
    '-L': true,
    '-S': true,
    '-F': true,
    '-Z': true,
    '-E': true
  },
  commands_inverted: {
    '--append': '-A',
    '--delete': '-D',
    '--insert': '-I',
    '--replace': '-R',
    '--new-chain': '-N',
    '--delete-chain': '-X',
    '--policy': '-P',
    '--list': '-L',
    '--list-rules': '-S',
    '--flush': '-F',
    '--zero': '-Z',
    '--rename-chain': '-E'
  },
  // parameters: ['-p', '-s', '-d', '-j', '-g', '-i', '-o', '-f', '-c'] # , '--log-prefix'
  // parameters_inverted:
  //   '--protocol': '-p', '--source': '-s', '--target': '-d', '--jump': '-j'
  //   '--goto': '-g', '--in-interface': '-i', '--out-interface': '-o',
  //   '--fragment': '-f', '--set-counters': '-c'
  parameters: [
    '--protocol',
    '--source',
    '--target',
    '--jump',
    '--goto',
    '--in-interface',
    '--out-interface',
    '--fragment',
    '--set-counters',
    '--log-level',
    '--log-prefix',
    '--log-tcp-sequence',
    '--log-tcp-options', // LOG
    '--log-ip-options',
    '--log-uid' // LOG
  ],
  parameters_inverted: {
    '-p': '--protocol',
    '-s': '--source',
    '-d': '--target',
    '-j': '--jump',
    '-g': '--goto',
    '-i': '--in-interface',
    '-o': '--out-interface',
    '-f': '--fragment',
    '-c': '--set-counters'
  },
  protocols: {
    tcp: ['--source-port', '--sport', '--target-port', '--dport', '--tcp-flags', '--syn', '--tcp-option'],
    udp: ['--source-port', '--sport', '--target-port', '--dport'],
    udplite: [],
    icmp: [],
    esp: [],
    ah: [],
    sctp: [],
    all: []
  },
  modules: {
    state: ['--state'],
    comment: ['--comment'],
    limit: ['--limit']
  },
  command_args: function(command, rule) {
    var arg, k, match, module, v;
    for (k in rule) {
      v = rule[k];
      if (['chain', 'rulenum', 'command'].indexOf(k) !== -1) {
        continue;
      }
      if (v == null) {
        continue;
      }
      if (match = /^([\w]+)\|([-\w]+)$/.exec(k)) {
        module = match[1];
        arg = match[2];
        command += ` -m ${module}`;
        command += ` ${arg} ${v}`;
      } else {
        command += ` ${k} ${v}`;
      }
    }
    return command;
  },
  command_replace: function(rule) {
    if (rule.rulenum == null) {
      rule.rulenum = 1;
    }
    return iptables.command_args(`iptables -R ${rule.chain} ${rule.rulenum}`, rule);
  },
  command_insert: function(rule) {
    if (rule.rulenum == null) {
      rule.rulenum = 1;
    }
    return iptables.command_args(`iptables -I ${rule.chain} ${rule.rulenum}`, rule);
  },
  command_append: function(rule) {
    if (rule.rulenum == null) {
      rule.rulenum = 1;
    }
    return iptables.command_args(`iptables -A ${rule.chain}`, rule);
  },
  command: function(oldrules, newrules) {
    var add_properties, baserule, commands, create, i, k, l, len, len1, len2, len3, len4, m, n, new_chains, newrule, o, old_chains, oldrule, p, rulenum, v;
    commands = [];
    new_chains = [];
    old_chains = oldrules.map(function(oldrule) {
      return oldrule.chain;
    }).filter(function(chain, i, chains) {
      return ['INPUT', 'FORWARD', 'OUTPUT'].indexOf(chain) < 0 && chains.indexOf(chain) >= i;
    });
// Create new chains
    for (l = 0, len = newrules.length; l < len; l++) {
      newrule = newrules[l];
      if (['INPUT', 'FORWARD', 'OUTPUT'].indexOf(newrule.chain) < 0 && new_chains.indexOf(newrule.chain) < 0 && old_chains.indexOf(newrule.chain) < 0) {
        new_chains.push(newrule.chain);
        commands.push(`iptables -N ${newrule.chain}`);
      }
    }
    for (m = 0, len1 = newrules.length; m < len1; m++) {
      newrule = newrules[m];
      // break if newrule.rulenum? #or newrule.command is '-A'
      if (newrule.after && !newrule.rulenum) {
        rulenum = 0;
        for (i = n = 0, len2 = oldrules.length; n < len2; i = ++n) {
          oldrule = oldrules[i];
          if (!(oldrule.command === '-A' && oldrule.chain === newrule.chain)) {
            continue;
          }
          rulenum++;
          if (utils.object.equals(newrule.after, oldrule, Object.keys(newrule.after))) {
            // newrule.rulenum = rulenum + 1
            newrule.rulenum = oldrule.rulenum + 1;
          }
        }
        // break
        delete newrule.after;
      }
      if (newrule.before && !newrule.rulenum) {
        rulenum = 0;
        for (i = o = 0, len3 = oldrules.length; o < len3; i = ++o) {
          oldrule = oldrules[i];
          if (!(oldrule.command === '-A' && oldrule.chain === newrule.chain)) {
            continue;
          }
          rulenum++;
          if (utils.object.equals(newrule.before, oldrule, Object.keys(newrule.before))) {
            // newrule.rulenum = rulenum
            newrule.rulenum = oldrule.rulenum;
            break;
          }
        }
        delete newrule.before;
      }
      create = true;
      // Get add properties present in new rule
      add_properties = utils.array.intersect(iptables.add_properties, Object.keys(newrule));
      for (p = 0, len4 = oldrules.length; p < len4; p++) {
        oldrule = oldrules[p];
        if (oldrule.chain !== newrule.chain) {
          continue;
        }
        // Add properties are the same
        if (utils.object.equals(newrule, oldrule, add_properties)) {
          create = false;
          // Check if we need to update
          if (!utils.object.equals(newrule, oldrule, iptables.modify_properties)) {
            // Remove the command
            baserule = merge(oldrule);
            for (k in baserule) {
              v = baserule[k];
              if (iptables.commands_arguments[k]) {
                baserule[k] = void 0;
              }
              baserule.command = void 0;
              newrule.rulenum = void 0;
            }
            commands.push(iptables.command_replace(merge(baserule, newrule)));
          }
        }
      }
      // Add properties are different
      if (create) {
        commands.push(newrule.command === '-A' ? iptables.command_append(newrule) : iptables.command_insert(newrule));
      }
    }
    return commands;
  },
  normalize: function(rules, position = true) {
    var k, l, len, len1, len2, len3, m, mk, mv, mvs, n, newrule, newrules, nk, o, oldrules, protocol, ref, ref1, rule, v;
    oldrules = Array.isArray(rules) ? rules : [rules];
    newrules = [];
    for (l = 0, len = oldrules.length; l < len; l++) {
      rule = oldrules[l];
      rule = merge(rule);
      newrule = {};
// Search for commands and parameters
      for (k in rule) {
        v = rule[k];
        nk = null;
        if (typeof v === 'number') {
          // Normalize value as string
          v = rule[k] = `${v}`;
        }
        // Normalize key as shortname (eg "-k")
        if (k === 'chain' || k === 'rulenum' || k === 'command') {
          // Final name, mark key as done
          nk = k;
        } else if (k.slice(0, 2) === '--' && iptables.parameters.indexOf(k) >= 0) {
          // nk = iptables.parameters_inverted[k]
          nk = k;
        } else if (k[0] !== '-' && iptables.parameters.indexOf(`--${k}`) >= 0) {
          // nk = iptables.parameters_inverted["--#{k}"]
          nk = `--${k}`;
        // else if iptables.parameters.indexOf(k) isnt -1
        } else if (iptables.parameters_inverted[k]) {
          nk = iptables.parameters_inverted[k];
        }
        // nk = k
        // Key has changed, replace it
        if (nk) {
          newrule[nk] = v;
          rule[k] = null;
        }
      }
      // Add prototol specific options
      if (protocol = newrule['--protocol']) {
        ref = iptables.protocols[protocol];
        for (m = 0, len1 = ref.length; m < len1; m++) {
          k = ref[m];
          if (rule[k]) {
            newrule[`${protocol}|${k}`] = rule[k];
            rule[k] = null;
          } else if (rule[k.slice(2)]) {
            newrule[`${protocol}|${k}`] = rule[k.slice(2)];
            rule[k.slice(2)] = null;
          }
        }
      }
      for (k in rule) {
        v = rule[k];
        if (!v) {
          continue;
        }
        if (k === 'after' || k === 'before') {
          newrule[k] = iptables.normalize(v, false);
          continue;
        }
        if (k.slice(0, 2) !== '--') {
          k = `--${k}`;
        }
        ref1 = iptables.modules;
        for (mk in ref1) {
          mvs = ref1[mk];
          for (n = 0, len2 = mvs.length; n < len2; n++) {
            mv = mvs[n];
            if (k === mv) {
              newrule[`${mk}|${k}`] = v;
              rule[k] = null;
            }
          }
        }
      }
      for (k in newrule) {
        v = newrule[k];
        if (k === 'command') {
          continue;
        }
        // Discard default log level value
        if (k === '--log-level' && v === '4') {
          delete newrule[k];
          continue;
        }
        if (k === 'comment|--comment') {
          // IPTables silently remove minus signs
          // v = v.replace '-', '' if /\-/.test v
          v = v.replace('-', '');
        }
        if (['--log-prefix', 'comment|--comment'].indexOf(k) !== -1) {
          v = jsesc(v, {
            quotes: 'double',
            wrap: true
          });
        }
        newrule[k] = v;
      }
      newrules.push(newrule);
    }
    if (position && newrule.command !== '-A') {
      for (o = 0, len3 = newrules.length; o < len3; o++) {
        newrule = newrules[o];
        if (!((newrule.after != null) || (newrule.before != null))) {
          // newrule.before = '-A': 'INPUT', chain: 'INPUT', '--jump': 'REJECT', '--reject-with': 'icmp-host-prohibited' unless newrule.after? or newrule.before?
          newrule.after = {
            '-A': 'INPUT',
            chain: 'INPUT',
            '--jump': 'ACCEPT'
          };
        }
      }
    }
    if (Array.isArray(rules)) {
      return newrules;
    } else {
      return newrules[0];
    }
  },
  /*
  Parse the result of `iptables -S`
  */
  parse: function(stdout) {
    var char, command_index, forceflush, i, j, key, l, len, len1, line, m, module, name, newarg, ref, ref1, rule, rules, v, value;
    rules = [];
    command_index = {};
    ref = utils.string.lines(stdout);
    for (l = 0, len = ref.length; l < len; l++) {
      line = ref[l];
      if (line.length === 0) {
        continue;
      }
      rule = {};
      i = 0;
      key = '';
      value = '';
      module = null;
      while (i <= line.length) {
        char = line[i];
        forceflush = i === line.length;
        newarg = (i === 0 && char === '-') || line.slice((i - 1), +i + 1 || 9e9) === ' -';
        if (newarg || forceflush) {
          if (value) {
            value = value.trim();
            if (key === '-m') {
              module = value;
            } else {
              if (module) {
                key = `${module}|${key}`;
              }
              if (iptables.parameters_inverted[key]) {
                key = iptables.parameters_inverted[key];
              }
              rule[key] = value;
            }
            // First key is a command
            if (iptables.commands_arguments[key]) {
              // Determine rule number
              if (Array.isArray(iptables.commands_arguments[key])) {
                rule.command = key;
                ref1 = value.split(' ');
                for (j = m = 0, len1 = ref1.length; m < len1; j = ++m) {
                  v = ref1[j];
                  rule[iptables.commands_arguments[key][j]] = v;
                }
                if (command_index[name = rule.chain] == null) {
                  command_index[name] = 0;
                }
                if (['-P', '-N'].indexOf(key) === -1) {
                  rule.rulenum = ++command_index[rule.chain];
                }
              }
            }
            key = '';
            value = '';
            if (forceflush) {
              break;
            }
          }
          key += char;
          while ((char = line[++i]) !== ' ') { // and line[i]?
            key += char;
          }
          // if iptables.parameters.indexOf(key) isnt -1
          if (iptables.parameters_inverted[key]) {
            module = null;
          }
          continue;
        }
        if (char === '"') {
          while ((char = line[++i]) !== '"') {
            value += char;
          }
          i++;
          continue;
        }
        while (char + (char = line[++i]) !== ' -' && i < line.length) {
          if (char === '-' && key === '--comment') {
            // IPTable silently remove minus sign from comment
            continue;
          }
          value += char;
        }
      }
      rules.push(rule);
    }
    return rules;
  }
};
