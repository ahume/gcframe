const assert = require('assert');
const sinon = require('sinon');

const cors = require('../src/cors');

describe('gcframe-cors', () => {
  let req;
  let res;
  let next;
  let status;
  let send;

  beforeEach(() => {
    status = sinon.spy(() => ({ send }));
    send = sinon.spy();
    req = {
      headers: {
        origin: 't.com',
      },
      path: '/',
    };
    res = {
      set: sinon.spy(() => ({ status })),
    };
    next = sinon.spy();
  });

  describe('wildcard origin', () => {
    it('adds CORS headers to GET request', () => {
      req.method = 'GET';
      cors({ allowOrigin: '*' }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 't.com'));
    });

    it('adds CORS headers to OPTIONS request', () => {
      req.method = 'OPTIONS';
      cors({ allowOrigin: '*', allowMethods: ['GET', 'PUT'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Methods', 'GET, PUT'));
      assert(res.set.calledWith('Access-Control-Allow-Origin', 't.com'));
    });
  });

  describe('specific origin', () => {
    it('adds CORS headers to GET request', () => {
      req.method = 'GET';
      cors({ allowOrigin: 'not.com' }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
    });

    it('adds CORS headers to OPTIONS request', () => {
      req.method = 'OPTIONS';
      cors({ allowOrigin: 'not.com', allowMethods: ['GET', 'PUT'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Methods', 'GET, PUT'));
      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
    });
  });

  describe('curried function', () => {
    it('can build/call derivatives', () => {
      req.method = 'OPTIONS';
      cors({ allowOrigin: 'not.com', allowMethods: ['GET', 'PUT'] })(next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Methods', 'GET, PUT'));
      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
    });
  });
});
