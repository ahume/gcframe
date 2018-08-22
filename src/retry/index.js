const curry = require('curry');

const eventIsTooOld = (maxAge, event) => Date.now() - Date.parse(event.timestamp) > maxAge;

const retry = (maxAge, next) => (event) => {
  if (eventIsTooOld(maxAge, event)) {
    return Promise.reject(new Error('Event is too old for retry. Exiting.'));
  }
  return next(event);
};

module.exports = curry(retry);
