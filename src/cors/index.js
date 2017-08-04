const curry = require('curry');

const cors = ({ allowOrigin, allowMethods = ['GET'] }, next) => (req, res) => {
  if (!req.headers.origin) {
    return next(req, res);
  }

  let origin = allowOrigin;
  if (allowOrigin === '*') {
    origin = req.headers.origin;
  }

  res.set('Access-Control-Allow-Origin', origin);
  if (req.method === 'OPTIONS') {
    return res.set('Access-Control-Allow-Methods', allowMethods.join(', '))
      .status(204).send();
  }

  return next(req, res);
};

module.exports = curry(cors);
