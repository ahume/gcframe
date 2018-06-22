/* eslint global-require: 0 */

// Packages
const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const googleapis = require('./stubs/googleapis');

// Rewired auth package
const auth = proxyquire('../src/auth', {
  googleapis,
});

// Consts
const authBucket = 'a-bucket-name';

describe('gcframe-auth', () => {
  let next;
  let req;
  let res;

  beforeEach(() => {
    next = sinon.spy();
    req = {
      get: () => 'Bearer 123token456',
    };
    res = {
      status: sinon.stub().returns({
        json: () => {},
      }),
    };
  });

  it('calls next if auth succeds', (done) => {
    auth({ authBucket }, next)(req, res)
      .then(() => {
        assert(next.calledOnce);
        assert(res.status.notCalled);
        done();
      });
  });

  it('can generate bucketname dynamically', (done) => {
    const generateName = () => 'another-bucket';
    auth({ generateAuthBucket: generateName }, next)(req, res)
    .then(() => {
      assert(next.calledOnce);
      assert(res.status.notCalled);
      done();
    });
  });

  it('returns 403 if auth fails', (done) => {
    googleapis.storage = () => ({
      buckets: {
        testIamPermissions: (config, something, callback) => {
          callback('an-error', null);
        },
      },
    });

    auth({ authBucket }, next)(req, res)
    .then(() => {
      assert(next.notCalled);
      assert(res.status.calledWith(403));
      done();
    });
  });
});
