/* eslint global-require: 0 */

const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const fsStub = {};

const { remoteConfig, fileConfig } = proxyquire('../src/env', {
  fs: fsStub,
  googleapis: require('./stubs/googleapis'),
  'properties-parser': require('./stubs/property-parser'),
});

describe('gcframe-env', () => {
  let postLoadCallback;
  let next;
  let req;
  let res;

  beforeEach(() => {
    process.env.KEY1 = undefined;
    process.env.KEY2 = undefined;
    process.env.GCFRAME_LOAD_COMPLETE = undefined;
    postLoadCallback = sinon.spy();
    next = sinon.spy();
    req = {};
    res = {};
  });

  describe('local file', () => {
    it('can load in key/value pairs', (done) => {
      fsStub.exists = (file, callback) => callback(true);
      remoteConfig('thing', postLoadCallback, next)(req, res);
      setTimeout(() => {
        assert.equal(process.env.KEY1, 'value1');
        assert(next.calledOnce);
        done();
      }, 1);
    });

    it('calls postLoadCallback function', (done) => {
      fsStub.exists = (file, callback) => callback(true);
      remoteConfig('thing', postLoadCallback, next)(req, res);
      setTimeout(() => {
        assert(postLoadCallback.calledOnce);
        done();
      }, 1);
    });
  });

  describe('remote config', () => {
    it('can load in key/value pairs', (done) => {
      fsStub.exists = (file, callback) => callback(false);
      remoteConfig('thing', postLoadCallback, next)(req, res);
      setTimeout(() => {
        assert.equal(process.env.KEY2, 'value2');
        assert(next.calledOnce);
        done();
      }, 1);
    });

    it('calls postLoadCallback function', (done) => {
      fsStub.exists = (file, callback) => callback(false);
      remoteConfig('thing', postLoadCallback, next)(req, res);
      setTimeout(() => {
        assert(postLoadCallback.calledOnce);
        done();
      }, 1);
    });

    it('returns fast if load complete flag is set', (done) => {
      process.env.GCFRAME_LOAD_COMPLETE = true;
      fsStub.exists = (file, callback) => callback(false);
      remoteConfig('thing', postLoadCallback, next)(req, res);
      setTimeout(() => {
        assert(next.calledOnce);
        assert(postLoadCallback.notCalled);
        done();
      }, 1);
    });
  });

  describe('abitrary local file', () => {
    it('can load in key/value pairs', (done) => {
      fileConfig('somefile.config', next)(req, res);
      setTimeout(() => {
        assert.equal(process.env.KEY1, 'value1');
        assert(next.calledOnce);
        done();
      });
    });
  });
});
