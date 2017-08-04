# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

## Router

```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

module.exports = {
  hello: router('GET', '/:name', helloWorld);
}
```

## Cors

```
function helloWorld (req, res) {
  return res.send('Hello World');
}

module.exports = {
  hello: cors({ allowOrigin: '*', allowMethods: 'POST' }, helloWorld)
}
```

## Composition

These functions are auto-curried handler-last functions, so they can be composed in a functional style.

```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

const handle = compose(
  cors({ 'allowOrigin': '*' });
  router('GET', '/:name');
)

module.exports = {
  helloWorld: handle(helloWorld)
}
```
