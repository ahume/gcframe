# GCFrame

Help serve HTTP endpoints with Google Cloud Functions.

## Environment Variables

This function loads variables stored in various locations into the node process environment variables. Making them available on `process.env` object. It can load from a GCP `runtime-config`, or from local files.

### Installation 

```
npm install -s gcframe-env
```

### API

```
env.remoteConfig(configName, callback, [, next])
```

Loads values from a `runtime-config` into the node process environment variables. Learn more about [runtime config](https://cloud.google.com/sdk/gcloud/reference/beta/runtime-config/)

| Argument     | Desription                                                         | Default  |
| ------------ | -------------------------------------------------------------------|----------|
| `configName` | The name of the `runtime-config` to load values from.              | required |
| `callback`   | A callback to run once runtime config is loaded (I can't remember why this is useful). | required |
| `next`       | A gcframe/middleware function, or the cloud function itself. If not provided the function returns a "partially applied" function which will except the `next` argument. | required |

```
env.fileConfig(filename, [, next])
```

Loads values from a local file into the node process environment variables. The file should contain values to load in the following format.
```
NAME1=VALUE1
NAME2=VALUE2
```

| Argument     | Desription                                                       | Default  |
| -----------| -------------------------------------------------------------------|----------|
| `filename` | The location of the file to load values from.                      | required |
| `next`     | A gcframe/middleware function, or the cloud function itself. If not provided the function returns a "partially applied" function which will except the `next` argument. | required |

```
env.fileConfigSync(filename)
```

Loads values from a local file into the node process environment variables. This is not a express middleware function, it just loads the values into the process and returns synchronously. The file should contain values to load in the following format.
```
NAME1=VALUE1
NAME2=VALUE2
```

| Argument     | Desription                                                       | Default  |
| -----------| -------------------------------------------------------------------|----------|
| `filename` | The location of the file to load values from.                      | required |


### Examples

```
const env = require('gcframe-env');

// Define google cloud function, main handler.
function helloWorld (req, res) {
  return res.send(`Hello ${process.env.NAME}`);
}

// Load myRemoteConfig runtime-config into environment variables.
var functionWithEnv = env.remoteConfig('myRemoteConfig', helloWorld);

module.exports = {
  helloWorld: functionWithEnv,
}
```

#### Compose router with other gcframe functions

`gcframe` functions are auto-curried handler-last functions, so they can be composed in a functional style.

```
const router = require('gcframe-router');
const env = require('gcframe-env);

// Define google cloud function, main handler.
function helloWorld (req, res) {
  // Access named parameter `key`.
  return res.send(`Hello ${req.params.name});
}

// Match GET requests with a single named parameter.
const routerMiddleware = router('GET', '/:key');
// Load myRemoteConfig runtime-config into environment variables.
const envMiddleware = env.remoteConfig('myRemoteConfig', helloWorld);

// Compose gcframe functions into a single middleware function.
const handle = compose(envMiddleware, routerMiddleware);

module.exports = {
  helloWorld: handle(helloWorld),
}
```


