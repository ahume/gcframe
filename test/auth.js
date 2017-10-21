/* eslint global-require: 0 */

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const googleapis = require('./stubs/googleapis');

const auth = proxyquire('../src/auth', {
  googleapis,
});

const authBucket = 'a-bucket-name';

describe('gcframe-auth', () => {
  let next;
  let req;
  let res;

  beforeEach(() => {
    next = sinon.spy();
    req = {
      get: () => 'Authorization: Bearer 123token456',
    };
    res = {
      status: sinon.stub().returns({
        json: () => {},
      }),
    };
  });

  it('calls next if auth succeds', (done) => {
    auth({ authBucket }, next)(req, res);
    setTimeout(() => {
      assert(next.calledOnce);
      assert(res.status.notCalled);
      done();
    }, 1);
  });

  it('returns 403 if auth fails', (done) => {
    googleapis.storage = () => ({
      buckets: {
        testIamPermissions: (config, something, callback) => {
          callback('an-error', null);
        },
      },
    });

    auth({ authBucket }, next)(req, res);
    setTimeout(() => {
      assert(next.notCalled);
      assert(res.status.calledWith(403));
      done();
    }, 1);
  });
});
