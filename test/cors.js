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
      // Return request headers
      header: (s) => req.headers[s],
    };
    res = {
      set: sinon.spy(() => ({ status })),
    };
    next = sinon.spy();
  });

  describe('there is no origin header', () => {
    it('does not add any CORS headers', () => {
      req.method = 'GET';
      req.headers = {};
      cors({ allowOrigin: '*' }, next)(req, res);

      assert(res.set.notCalled);
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });
  });

  describe('wildcard origin', () => {
    it('adds CORS headers to GET request', () => {
      req.method = 'GET';
      cors({ allowOrigin: '*', allowMethods: ['GET', 'PUT'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 't.com'));
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });

    it('adds CORS headers to OPTIONS request', () => {
      req.method = 'OPTIONS';
      cors({ allowOrigin: '*', allowMethods: ['GET', 'PUT'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Methods', 'GET, PUT'));
      assert(res.set.calledWith('Access-Control-Allow-Origin', 't.com'));
      assert(status.calledWith(204));
      assert(send.calledOnce);
    });
  });

  describe('specific origin', () => {
    it('adds CORS headers to GET request', () => {
      req.method = 'GET';
      cors({ allowOrigin: 'not.com' }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });

    it('adds CORS headers to OPTIONS request', () => {
      req.method = 'OPTIONS';
      cors({ allowOrigin: 'not.com', allowMethods: ['GET', 'PUT'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Methods', 'GET, PUT'));
      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
      assert(status.calledWith(204));
      assert(send.calledOnce);
    });
  });

  describe('request-headers header', () => {
    it('does not include header if not requested', () => {
      req.method = 'GET';
      cors({ allowOrigin: 'not.com', allowHeaders: ['THING'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
      assert(!res.set.calledWith('Access-Control-Allow-Headers'));
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });
    it('includes header with allowed headers listed', () => {
      req.method = 'GET';
      req.headers['Access-Control-Request-Headers'] = 'Authorization';
      cors({ allowOrigin: 'not.com', allowHeaders: ['Authorization', 'THING'] }, next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
      assert(res.set.calledWith('Access-Control-Allow-Headers', 'authorization'));
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });
  });

  describe('curried function', () => {
    it('can build/call derivatives', () => {
      req.method = 'GET';
      cors({ allowOrigin: 'not.com', allowMethods: ['GET', 'PUT'] })(next)(req, res);

      assert(res.set.calledWith('Access-Control-Allow-Origin', 'not.com'));
      assert(next.calledOnce);
      assert(next.calledWith(req, res));
    });
  });
});
