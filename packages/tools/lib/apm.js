// Generated by CoffeeScript 2.5.1
// # `nikita.tools.apm`

// Install Atom packages with APM.

// ## Options

// *   `name` (string|array)
//     Name of the package(s).
// *   `upgrade` (boolean)
//     Upgrade all packages, default to "false".

// ## Source code
var indexOf = [].indexOf;

module.exports = function({options}) {
  var installed, outdated;
  if (options.argument != null) {
    options.name = options.argument;
  }
  if (typeof options.name === 'string') {
    options.name = [options.name];
  }
  options.name = options.name.map(function(pkg) {
    return pkg.toLowerCase();
  });
  outdated = [];
  installed = [];
  // Note, cant see a difference between update and upgrade after printing help
  this.system.execute({
    cmd: "apm outdated --json",
    shy: true
  }, function(err, {stdout}) {
    var pkgs;
    if (err) {
      throw err;
    }
    pkgs = JSON.parse(stdout);
    return outdated = pkgs.map(function(pkg) {
      return pkg.name.toLowerCase();
    });
  });
  this.system.execute({
    cmd: "apm upgrade --no-confirm",
    if: function() {
      return options.upgrade && outdated.length;
    }
  }, function(err) {
    if (err) {
      throw err;
    }
    return outdated = [];
  });
  this.system.execute({
    cmd: "apm list --installed --json",
    shy: true
  }, function(err, {stdout}) {
    var pkgs;
    if (err) {
      throw err;
    }
    pkgs = JSON.parse(stdout);
    pkgs = pkgs.user.map(function(pkg) {
      return pkg.name.toLowerCase();
    });
    return installed = pkgs;
  });
  return this.call(function() {
    var install, upgrade;
    upgrade = options.name.filter(function(pkg) {
      return indexOf.call(outdated, pkg) >= 0;
    });
    install = options.name.filter(function(pkg) {
      return indexOf.call(installed, pkg) < 0;
    });
    this.system.execute({
      cmd: `apm upgrade ${upgrade.join(' ')}`,
      if: upgrade.length
    }, (err) => {
      return this.log({
        message: `APM Updated Packages: ${upgrade.join(', ')}`
      });
    });
    return this.system.execute({
      cmd: `apm install ${install.join(' ')}`,
      if: install.length
    }, (err) => {
      return this.log({
        message: `APM Installed Packages: ${install.join(', ')}`
      });
    });
  });
};
