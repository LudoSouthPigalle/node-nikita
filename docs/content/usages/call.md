---
navtitle: Call
sort: 2
---

# Call and user defined handlers

Nikita gives you the choice between calling your own function, which we call handlers, or calling an [registered function](/current/usages/registry) by its name.

## Calling a function

In its simplest form, user defined handler is just a function passed to "call". Here's an illustration:

```js
nikita
.call(() => {
  // Do something...
})
```

This is internally converted to:

```js
nikita
.call({
  handler: () => {
    // Do something...
  }
})
```

Use the expanded object syntax to pass additional information. For example, we could add the [`retry` metadata](/current/metadata/retry) or [configuration properties](/current/action/config):

```js
nikita
.call({
  // highlight-range{1-4}
  metadata: {
    retry: 2
  },
  my_config: 'my_value',
  handler: ({config}) => {
    // Passing config.my_config
  }
})
```

Note, the above code could be arguably simplified using 2 arguments:

```js
nikita
.call({
  metadata: {
    retry: 2
  },
  my_config: 'my_value',
}, ({config}) => {
  // Passing config.my_config
})
```

## Calling a module

If no handler is yet defined, a string is interpreted as an external module exporting a handler function or object. The 4 calls below are all equivalent:

```js
nikita
// Pass with require
.call(require('path/to/module'))
// Pass with require in expanded object syntax
.call({
  handler: require('path/to/module')
})
// Pass as a string
.call('path/to/module')
// Pass as a string in expanded object syntax
.call({
  handler: 'path/to/module'
})
```

Internally, module is required with the call `require.main.require`.
