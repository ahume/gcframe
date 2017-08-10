const curry = require('curry');

const trim = (s) => s.trim();

const cors = ({ allowOrigin, allowMethods = ['GET'], allowHeaders = [] }, next) => (req, res) => {
  if (!req.headers.origin) {
    return next(req, res);
  }

  let origin = allowOrigin;
  if (allowOrigin === '*') {
    origin = req.headers.origin;
  }

  res.set('Access-Control-Allow-Origin', origin);
  const requestedHeaders = req.header('Access-Control-Request-Headers');

  if (requestedHeaders) {
    const allowed = requestedHeaders.split(',').map(trim).filter((header) =>
      allowHeaders.includes(header));

    if (allowed.length > 0) {
      res.set('Access-Control-Allow-Headers', allowed.join(', '));
    }
  }
  if (req.method === 'OPTIONS') {
    return res.set('Access-Control-Allow-Methods', allowMethods.join(', '))
      .status(204).send();
  }

  return next(req, res);
};

module.exports = curry(cors);
