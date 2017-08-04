const assert = require('assert');
const sinon = require('sinon');

const router = require('../src/router');

describe('gcframe-router', () => {
  let req;
  let res;
  let next;
  let send;

  beforeEach(() => {
    send = sinon.spy();
    req = {
      path: '/',
    };
    res = {
      status: sinon.spy(() => ({ send })),
    };
    next = sinon.spy();
  });

  describe('method', () => {
    it('should send 501 (not implemented) if not matching', () => {
      req.method = 'POST';

      router('GET', '/', next)(req, res);

      assert(res.status.calledWith(501));
      assert(send.calledOnce);
    });

    it('should call next if matching', () => {
      req.method = 'GET';

      router('GET', '/', next)(req, res);

      assert(next.calledOnce);
    });

    it('always matches OPTIONS method', () => {
      req.method = 'OPTIONS';

      router('GET', '/', next)(req, res);

      assert(next.calledOnce);
    });
  });

  describe('path', () => {
    it('should send 404 if not matching', () => {
      req.method = 'GET';

      router('GET', '/123', next)(req, res);

      assert(res.status.calledWith(404));
      assert(send.calledOnce);
    });

    it('should call next if path matching', () => {
      req.method = 'GET';
      req.path = '/123';

      router('GET', '/123', next)(req, res);

      assert(next.calledOnce);
    });

    it('should call next if path and params match', () => {
      req.method = 'GET';
      req.path = '/object/123';

      router('GET', '/object/:id', next)(req, res);

      assert(next.calledOnce);
    });

    it('should add params to req', () => {
      req.method = 'GET';
      req.path = '/object/123';

      router('GET', '/object/:id', next)(req, res);

      assert(next.calledOnce);
      assert.equal(next.lastCall.args[0].params.id, 123);
      assert.equal(next.lastCall.args[0].path, '/object/123');
    });
  });

  describe('curried function', () => {
    it('can build/call derivatives', () => {
      req.method = 'PUT';
      req.path = '/object/123';

      router('PUT')('/object/:id')(next)(req, res);

      assert(next.calledOnce);
      assert.equal(next.lastCall.args[0].params.id, 123);
      assert.equal(next.lastCall.args[0].path, '/object/123');
    });
  });
});
