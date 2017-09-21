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
  let next;
  let req;
  let res;

  beforeEach(() => {
    next = sinon.spy();
    req = {};
    res = {};
  });

  describe('local file', () => {
    it('can load in key/value pairs', (done) => {
      fsStub.exists = (file, callback) => callback(true);
      remoteConfig('thing', next)(req, res);
      setTimeout(() => {
        assert.equal(process.env.KEY1, 'value1');
        assert(next.calledOnce);
        done();
      }, 1);
    });
  });

  describe('remote config', () => {
    it('can load in key/value pairs', (done) => {
      fsStub.exists = (file, callback) => callback(false);
      remoteConfig('thing', next)(req, res);
      setTimeout(() => {
        assert.equal(process.env.KEY2, 'value2');
        assert(next.calledOnce);
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
