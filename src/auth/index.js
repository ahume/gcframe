const curry = require('curry');
const Google = require('googleapis');

const getAccessToken = (header) => {
  if (header) {
    const match = header.match(/^Bearer\s+([^\s]+)$/);
    if (match) {
      return match[1];
    }
  }
  return null;
};

const env = ({ authBucket, generateAuthBucket }, next) => (req, res) => {
  const accessToken = getAccessToken(req.get('Authorization'));
  const oauth = new Google.auth.OAuth2();
  oauth.setCredentials({ access_token: accessToken });

  let bucket = authBucket;
  if (typeof generateAuthBucket === 'function') {
    bucket = generateAuthBucket(req);
    if (typeof bucket !== 'string') {
      res.status(403).json({
        code: 403,
        message: 'The request is forbidden. Could not generate auth bucket name.',
      });
      return;
    }
  }

  const permission = 'storage.buckets.get';
  const gcs = Google.storage('v1');
  gcs.buckets.testIamPermissions({
    bucket,
    permissions: [permission],
    auth: oauth,
  }, {}, (err, response) => {
    if (response && response.permissions && response.permissions.includes(permission)) {
      next(req, res);
    } else {
      res.status(403).json({
        code: 403,
        message: `The request is forbidden. ${bucket} did not allow access`,
      });
    }
  });
};

module.exports = curry(env);