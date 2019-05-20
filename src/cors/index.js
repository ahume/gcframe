const curry = require('curry');

const trim = (s) => s.trim();
const lowercase = (s) => s.toLowerCase();

const cors = ({ allowOrigin, allowMethods = ['GET'], allowHeaders = [], exposeHeaders = [] }, next) => (req, res) => {
  if (!req.headers.origin) {
    return next(req, res);
  }

  const wildcardPort = `${req.headers.origin.split(/:\d/)[0]}:*`;

  const setAllowedOriginHeader =
    // Set the header if the origin is in the allowed list
    (allowOrigin instanceof Array && (allowOrigin.includes(req.headers.origin) ||
    // Special case for wildcard ports
    allowOrigin.includes(wildcardPort))) ||
    // Or if the special case * is passed in.
    allowOrigin === '*';

  if (setAllowedOriginHeader) {
    res.set('Access-Control-Allow-Origin', req.headers.origin);
  }

  const requestedHeaders = req.header('Access-Control-Request-Headers');

  if (exposeHeaders.length > 0) {
    res.set('Access-Control-Expose-Headers', exposeHeaders.join(', '));
  }

  if (requestedHeaders) {
    const allowed = requestedHeaders.split(',').map(trim).map(lowercase).filter((header) =>
      allowHeaders.map(trim).map(lowercase).includes(header));

    if (allowed.length > 0) {
      res.set('Access-Control-Allow-Headers', allowed.map(lowercase).join(', '));
    }
  }
  if (req.method === 'OPTIONS') {
    return res.set('Access-Control-Allow-Methods', allowMethods.join(', '))
      .status(204).send();
  }

  return next(req, res);
};

module.exports = curry(cors);
