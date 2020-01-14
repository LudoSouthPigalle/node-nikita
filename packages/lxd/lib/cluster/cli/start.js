// Generated by CoffeeScript 2.4.1
var key, nikita;

nikita = require('nikita');

key = `${__dirname}/../../../assets/.vagrant/machines/default/virtualbox/private_key`;

module.exports = function({params}) {
  return nikita({
    debug: params.debug
  }).system.execute({
    header: 'Dependencies',
    unless_exec: 'vagrant plugin list | egrep \'^vagrant-vbguest \'',
    cmd: 'vagrant plugin install vagrant-vbguest'
  }).system.execute({
    cwd: `${__dirname}/../../../assets`,
    cmd: 'vagrant up'
  }).system.execute({
    cmd: 'lxc remote add nikita 127.0.0.1:8443 --accept-certificate --password secret\nlxc remote switch nikita'
  }).system.execute({
    cmd: 'lxc ls || {\n  lxc remote switch local\n  lxc remote remove nikita\n  lxc remote add nikita --accept-certificate --password secret 127.0.0.1:8443\n  lxc remote switch nikita\n}'
  }).call(function() {
    return {
      disabled: true,
      cmd: `ssh -i ${key} -qtt -p 2222 vagrant@127.0.0.1 -- "cd /nikita && bash"\n`,
      stdin: process.stdin,
      stderr: process.stderr,
      stdout: process.stdout
    };
  }).call(function() {
    return process.stdout.write(`ssh -i ${key} -qtt -p 2222 vagrant@127.0.0.1 -- "cd /nikita && bash"\n`);
  });
};
