# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

## Auth

The auth function can be used to authenticate the origin of an HTTP request, based on a `Authorization` header containing a access token for a Google account (or service account). It uses the mechanism described in [Authentication in HTTP Cloud Functions](https://cloud.google.com/solutions/authentication-in-http-cloud-functions) which uses a specially designated Cloud Storage bucket as a proxy for managing authentication the autorization of the cloud function trigger.

### Installation 

```
npm install -s gcframe-auth
```

### API

```
auth(bucketName, [, next])
```

Only allows access to requests with an authorized access token included in their request. Pass an access token via the `Authorization` header. `Authorization: Bearer ${TOKEN}`

| Argument    | Desription                                                                 | Default  |
| ----------- | ---------------------------------------------------------------------------|----------|
| `bucketName`| The name of the GCS bucket against which the auth check will be performed. | required |
| `next`      | A gcframe/middleware function, or the cloud function itself. If not provided the function returns a "partially applied" function which will except the `next` argument. | required |

### Examples

```
const auth = require('gcframe-auth');

// Define google cloud function, main handler.
function helloWorld (req, res) {
  return res.send(`Hello secret world`);
}

// Only allow users if the token in the request has access to the `myProxyBucket`.
var authdFunction = auth('myProxyBucket', helloWorld);

module.exports = {
  helloWorld: authdFunction,
}
```

#### Compose router with other gcframe functions

`gcframe` functions are auto-curried handler-last functions, so they can be composed in a functional style.

```
const router = require('gcframe-router');
const auth = require('gcframe-auth);

// Define google cloud function, main handler.
function helloWorld (req, res) {
  // Access named parameter `key`.
  return res.send(`Hello ${req.params.name});
}

// Match GET requests with a single named parameter.
const routerMiddleware = router('GET', '/:key');
// Only allow users if the token in the request has access to the `myProxyBucket`.
const authMiddleware = auth('myProxyBucket');

// Compose gcframe functions into a single middleware function.
const handle = compose(authMiddleware, routerMiddleware);

module.exports = {
  helloWorld: handle(helloWorld),
}
```


