
var assert = require('assert');
var shortid = require('shortid');
var { defineModel, models, authenticate } = require('../dist/jazzy-auth');

describe('defineModel()', function () {
  it('thorw error if getUser() is not a function', function (done) {
    const modelName = shortid.generate();
    defineModel(modelName, { getUser: 'should cause error' });
    try {
      authenticate(modelName);
    } catch (err) {
      done();
    }
  });
  it('thorw error if verify is not a function', function (done) {
    const modelName = shortid.generate();
    defineModel(modelName, { verify: 'should cause error' });
    try {
      authenticate(modelName);
    } catch (err) {
      done();
    }
  });
});
