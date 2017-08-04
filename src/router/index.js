const route = require('path-match')();
const curry = require('curry');

// Allow options on all requests, lets CORS pre-flight through more easily.
const allowedMethods = ['OPTIONS'];

const router = (method, path, next) => (req, res) => {
  const methods = allowedMethods.concat([method]);

  // 501 if not the right method.
  if (methods.indexOf(req.method) < 0) {
    return res.status(501).send();
  }

  // req.path is null for root of GCF real, In emulator it is '/'.
  // This at least makes it consistent.
  const requestPath = req.path || '/';

  // Otherwise find any params
  const match = route(path);
  const params = match(requestPath);

  if (params === false) {
    return res.status(404).send();
  }

  return next(Object.assign(req, { params }), res);
};

module.exports = curry(router);
