---
sort: 7
---

# Control Flow

Nikita run every actions sequentially. This behavior ensures there are no conflicts between two commands executed simultaneously. Moreover, this sequential nature is aligned with SSH which executes one command at a time over a given connection.

## Sequential execution

Since an action may contain child actions, the way Nikita run is similar to how you might want to traverse a file system. For every action scheduled, Nikita will run its children recursively before passing to the next scheduled action. Let's imaging we want to install 2 packages `my_pkg_1` and `my_pkg_2` before modifying a configuration file:

```js
nikita
.call(function() {
  this.service('my_pkg_1')
  this.service('my_pkg_2')
})
.file.yaml({
  target: '/etc/my_pkg/config.yaml',
  content: { my_property: 'my value' }
})
```

The actions will be executed in this sequence:

* `call`
* `service` for `my_pkg_1`
* `service` for `my_pkg_2`
* `file.yaml`

This tree-like traversal is leverage by the `header` metadata and the `log.cli` action to display a report to the terminal.

```js
nikita
.log.cli({pad: {header: 20}})
.call({
  metadata: { header: 'Packages' }
}, function() {
  this.service({
    metadata: { header: 'My PKG 1' }
  }, 'my_pkg_1')
  this.service({
    metadata: { header: 'My PKG 2' }
  }, 'my_pkg_2')
})
.file.yaml({
  metadata: { header: 'Config' },
  target: '/etc/my_pkg/config.yaml',
  content: { my_property: 'my value' }
})
```

Will output:

```
localhost   Packages : My PKG 1  -  1ms
localhost   Packages : My PKG 2  -  1ms
localhost   Packages             -  3ms
localhost   Config               -  10ms
```

## Condition and status

You can control your flow with mixing [conditions](/current/usages/conditions/) and [the output](/current/action/output) such as [`status`](/current/usages/status/) and [`error`](/current/usages/error/) returned after execution of the actions.

> Note, Nikita actions always return [Javascript Promise](https://nodejs.dev/learn/understanding-javascript-promises). To access the action's output, you have to call an asynchronous function and await for the result from Promise.

For example, using `status`:

```js
nikita
.call(async function() {
  // Get status of the first action
  const {status} = await this.execute({
    command: 'echo catchme | grep catchme' // Returns status true
  })
  // Run next action if status true
  this.call({
    if: status
  }, function(){
    console.info('The condition passed, because the status is true')
  })
})
```

An example using `error`:

```js
nikita
.call(async function() {
  // Get error of the first action
  const {error} = await this.execute({
    metadata: {relax: true},  // Don't throw an error if occured
    command: 'echo missyou | grep catchme' // Will be errored
  })
  // Run next action if error
  this.call({
    if: error
  }, function(){
    console.info('The condition passed because an error occured')
  })
})
```
