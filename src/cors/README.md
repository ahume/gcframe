# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

## Cors

The CORS middleware helps allow/deny access to an HTTP function based on CORS request headers. If it does not receive an `Origin` header it will allow access.

### Installation 

```
npm install -s gcframe-cors
```

### API

```
cors(options, [, next])
```

Allows/denies HTTP access to a function based on CORS request headers received.

| Argument  | Desription                                                         | Default  |
| ----------| -------------------------------------------------------------------|----------|
| `options.allowOrigin`  | An Array object containing a list of allowed origins. Or a special case `*` string to match all origins. | []      |
| `options.allowMethods` | An Array object containing a list of allowed methods.                                                    | ['GET'] |
| `options.allowHeaders` | An Array object containing a list of allowed headers.                                                    | []      |
| `next`                 | A gcframe/middleware function, or the cloud function itself. If not provided the function returns a "partially applied" function which will except the `next` argument. | required |

### Examples

```
const cors = require('gcframe-cors');

// Define google cloud function, main handler.
function helloWorld (req, res) {
  return res.send(`Hello world`);
}

// Allow all origins to make POST requests to the function.
var functionWithCors = cors({ allowOrigin: '*', allowMethods: 'POST' }, helloWorld)

module.exports = {
  helloWorld: functionWithCors,
}
```

#### Compose router with other gcframe functions

`gcframe` functions are auto-curried handler-last functions, so they can be composed in a functional style.

```
const router = require('gcframe-router');
const cors = require('gcframe-cors);

// Define google cloud function, main handler.
function helloWorld (req, res) {
  // Access named parameter `key`.
  return res.send(`Hello ${req.params.name});
}

// Match GET requests with a single named parameter.
const routerMiddleware = router('GET', '/:key');
// Allow all origins to make POST requests to the function.
const corsMiddleware = cors({ allowOrigin: '*', allowMethods: 'POST' }, helloWorld)

// Compose gcframe functions into a single middleware function.
const handle = compose(corsMiddleware, routerMiddleware);

module.exports = {
  helloWorld: handle(helloWorld),
}
```


