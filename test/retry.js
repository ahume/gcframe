const assert = require('assert');
const sinon = require('sinon');

const retry = require('../src/retry');

describe.only('gcframe-retry', () => {
  let event;
  let next;

  beforeEach(() => {
    event = {
      timestamp: new Date(),
    };
    next = sinon.spy();
  });

  it('calls next if the timestamp is within 60000ms', () => {
    retry(60000, next)(event);

    assert(next.calledOnce);
    assert(next.calledWith(event));
  });

  it('exits early if the timestamp is over 60000ms old', (done) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    event.timestamp = d;
    retry(60000, next)(event)
      .catch(() => {
        assert(next.notCalled);
        done();
      });
  });
});
