# GCFrame

Help serve HTTP endpoints with Google Cloud Functions

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
  hello: cors({ allowDomain: '*', allowMethods: 'POST' }, helloWorld)
}
```
