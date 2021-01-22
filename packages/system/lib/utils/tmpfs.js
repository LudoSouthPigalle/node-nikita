// Generated by CoffeeScript 2.5.1
// parse the content of tmpfs daemon configuration file
var string;

string = require('@nikitajs/engine/lib/utils/string');

module.exports = {
  parse: function(str) {
    var files, lines;
    lines = string.lines(str);
    files = {};
    lines.forEach(function(line, _, __) {
      var age, argu, gid, i, key, mode, mount, obj, ref, results, type, uid, values;
      if (!line || line.match(/^#.*$/)) {
        return;
      }
      values = [type, mount, mode, uid, gid, age, argu] = line.split(/\s+/);
      obj = {};
      ref = ['type', 'mount', 'perm', 'uid', 'gid', 'age', 'argu'];
      results = [];
      for (i in ref) {
        key = ref[i];
        obj[key] = values[i] !== void 0 ? values[i] : '-';
        if (i === `${values.length - 1}`) {
          if (obj['mount'] != null) {
            results.push(files[mount] = obj);
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    return files;
  },
  stringify: function(obj) {
    var i, k, key, lines, ref, v;
    lines = [];
    for (k in obj) {
      v = obj[k];
      ref = ['mount', 'perm', 'uid', 'gid', 'age', 'argu'];
      for (i in ref) {
        key = ref[i];
        v[key] = v[key] !== void 0 ? v[key] : '-';
      }
      lines.push(`${v.type} ${v.mount} ${v.perm} ${v.uid} ${v.gid} ${v.age} ${v.argu}`);
    }
    return lines.join('\n');
  }
};