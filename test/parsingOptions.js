
var assert = require('assert');
var shortid = require('shortid');
var { define, models, authenticate } = require('../dist/index');

describe('define()', function () {
  it('thorw error if getUser() is not a function', function (done) {
    const modelName = shortid.generate();
    define(modelName, { getUser: 'should cause error' });
    try {
      authenticate(modelName);
    } catch (err) {
      done();
    }
  });
  it('thorw error if verify is not a function', function (done) {
    const modelName = shortid.generate();
    define(modelName, { verify: 'should cause error' });
    try {
      authenticate(modelName);
    } catch (err) {
      done();
    }
  });
});
