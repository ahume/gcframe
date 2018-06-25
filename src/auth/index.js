// Imports
const curry = require('curry');
const Google = require('googleapis');
const winston = require('winston');

// Consts
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Lets define an gcframeauthError to let us know our middleware failed
class GCFrameAuthError extends Error {
  constructor({ message, code, stack }) {
    super();
    this.message = message;
    this.code = code;
    this.stack = stack;
  }
}

// Lets grab the accessToken
const getAccessToken = (header) =>
  new Promise((resolve, reject) => {
    if (!header) {
      reject({
        code: 403,
        message: 'No Authorization header supplied',
      });
      return;
    }
    const match = header.match(/^Bearer\s+([^\s]+)$/);
    if (!match) {
      reject({
        code: 403,
        message: 'No access-token found in Authorization header',
      });
      return;
    }
    resolve(match[1]);
  }).catch((err) => {
    logger.log({
      level: 'error',
      message: `error occurred at getAccessToken: ${JSON.stringify(err)}`,
    });
    throw new GCFrameAuthError(err);
  });

// Lets retrieve user info via access token
const retrieveUserInformation = (accessToken) => {
  const userInfoClient = Google.oauth2('v2').userinfo;
  return new Promise((resolve) => {
    userInfoClient.get({ access_token: accessToken }, {}, (err, userInfo) => {
      // If we weren't able to retrieve user info, log this but let the
      // function continue through to bucket auth. We just won't know who was
      // doing it.
      if (err) {
        logger.log({
          level: 'warn',
          message: `unable to retrieve user info: ${JSON.stringify(err)}`,
        });
      }
      resolve(userInfo);
    });
  }).catch((err) => {
    logger.log({
      level: 'error',
      message: `error occurred at retrieveUserInformation: ${JSON.stringify(err)}`,
    });
    throw new GCFrameAuthError(err);
  });
};

// Lets generate a OAuth object
const generateGoogleOAuth = (accessToken) => {
  const oauth = new Google.auth.OAuth2();
  oauth.setCredentials({ access_token: accessToken });
  return oauth;
};

// Lets derive which kind of google storage bucket was requested
const deriveGoogleStorageBucket = (authBucket, authBucketGenerator, req) =>
  new Promise((resolve, reject) => {
    let bucket = authBucket;
    if (typeof authBucketGenerator === 'function') {
      bucket = authBucketGenerator(req);
      if (typeof bucket !== 'string') {
        reject({
          code: 403,
          message:
            'The request is forbidden. Could not generate auth bucket name.',
        });
        return;
      }
    }
    resolve(bucket);
  }).catch((err) => {
    logger.log({
      level: 'error',
      message: `error occurred at deriveGoogleStorageBucket: ${JSON.stringify(err)}`,
    });
    throw new GCFrameAuthError(err);
  });

// Lets check a persons permissions for the storage bucket
const checkUserPermissionForStorageBucket = (bucket, oauth) =>
  new Promise((resolve, reject) => {
    const permission = 'storage.buckets.get';
    const gcs = Google.storage('v1');
    const opts = {
      bucket,
      permissions: [permission],
      auth: oauth,
    };
    gcs.buckets.testIamPermissions(opts, {}, (err, response) => {
      if (
        response &&
        response.permissions &&
        response.permissions.includes(permission)
      ) {
        resolve();
      } else {
        reject({
          code: 403,
          message: `The request is forbidden. ${bucket} did not allow access`,
        });
      }
    });
  }).catch((err) => {
    logger.log({
      level: 'error',
      message: `error occurred at checkUserPermissionForStorageBucket: ${JSON.stringify(err)}`,
    });
    throw new GCFrameAuthError(err);
  });

// Exported middleware for GCF or Express.js
const env = ({ authBucket, generateAuthBucket }, next) => (req, res) => {
  let oauth = null;
  let decoratedReq = req;
  let accessToken = null;
  return getAccessToken(req.get('Authorization'))
    .then((aT) => {
      accessToken = aT;
    })
    .then(() => retrieveUserInformation(accessToken))
    .then((info) => {
      decoratedReq = Object.assign(req, { gcframe: info });
    })
    .then(() => {
      oauth = generateGoogleOAuth(accessToken);
    })
    .then(() => deriveGoogleStorageBucket(authBucket, generateAuthBucket, decoratedReq))
    .then((bucket) => checkUserPermissionForStorageBucket(bucket, oauth))
    .then(() => next(decoratedReq, res))
    .catch((err) => {
      // Here we can handle GCFrameAuthErrors and send the correct response back to a client.
      // If there is an err thrown in next(req, res) AND not handled, send it to express to handle.
      // next(err) is the fallback way of handling errs as defined here:
      //  https://expressjs.com/en/guide/error-handling.html
      if (err instanceof GCFrameAuthError) {
        res.status(err.code !== undefined ? err.code : 500).json(err);
      } else next(err);
    });
};

module.exports = curry(env);
