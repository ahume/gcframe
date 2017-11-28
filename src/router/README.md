# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

## Router

The router helps to match incoming requests based on HTTP method and path and either pass them on to your main function handler if they match or serve an appropriate HTTP response if they do not. It's API is similar to the express.js router.

### Installation 

```
npm install -s gcframe-router
```

### API

```
router(method, path, [, next])
```

Attempts to match HTTP requests based on method (GET, PUT, POST, etc) and path.

| Argument  | Desription                                                         | Default  |
| ----------| -------------------------------------------------------------------|----------|
| `method`  | HTTP method to match (e.g GET, PUT, POST, DELETE).                 | required |
| `path`    | The path for which the main cloud function is invoked.             | required |
| `next`    | A gcframe/middleware function, or the cloud function itself. If not provided the function returns a "partially applied" function which will except the `next` argument. | required |

### Examples

```
const router = require('gcframe-router');

// Define google cloud function, main handler.
function helloWorld (req, res) {
  // Access named parameter `key`.
  return res.send(`Hello ${req.params.name});
}

// Match GET requests with a single named parameter.
var routedFunction = router('GET', '/:key', helloWorld);

module.exports = {
  helloWorld: routedFunction,
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
// Return CORS headers allowing all origins.
const corsMiddleware = cors({ allowOrigin: '*' });

// Compose gcframe functions into a single middleware function.
const handle = compose(corsMiddleware, routerMiddleware);

module.exports = {
  helloWorld: handle(helloWorld),
}
```


