# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

There's a bunch of common things you probably want to do when serving HTTP endpoints via Google Cloud Functions. These micro libraries help out with that.

## Functions

### Router
```
npm install -s gcframe-router
```
```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

module.exports = {
  helloWorld: router('GET', '/:name', helloWorld);
}
```
[View Router docs](src/router/README.md)

### Environment Variables
```
npm install -s gcframe-env
```
```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

module.exports = {
  helloWorld: env.remoteConfig('remote-config', callback, helloWorld);
}
```
[View Environment Variables docs](src/env/README.md)

### Cors
```
npm install -s gcframe-cors
```
```
function helloWorld (req, res) {
  return res.send('Hello World');
}

module.exports = {
  helloWorld: cors({ allowOrigin: '*', allowMethods: 'POST' }, helloWorld)
}
```
[View Cors docs](src/cors/README.md)

### Auth
```
npm install -s gcframe-auth
```
```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

module.exports = {
  helloWorld: auth({ authBucket: 'gcs-bucket-proxying-auth' }, helloWorld);
}
```
[View Auth docs](src/auth/README.md)


## Composition

These functions are auto-curried handler-last functions, so they can be composed in a functional style.

```
function helloWorld (req, res) {
  return res.send(`Hello ${req.params.name});
}

const handle = compose(
  auth({ authBucket: 'my-auth-bucket' }),
  cors({ allowOrigin: '*' }),
  router('GET', '/:name'),
)

module.exports = {
  helloWorld: handle(helloWorld),
}
```
