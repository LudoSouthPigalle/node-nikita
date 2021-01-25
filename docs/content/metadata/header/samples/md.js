// hide-next-line
const nikita = require('nikita');
nikita
.log.md({
  basedir: '/tmp/my_app/log'
})
.call({
  metadata: {
    header: 'My App'
  }
}, function(){
  this.file.yaml({
    metadata: {
      header: 'Configuration'
    },
    target: '/tmp/my_app/config.yaml',
    content: { http_port: 8000 }
  })
})
