
var assert = require('assert');
var shortid = require('shortid');
var { define, models, modify } = require('../dist/index');

describe('modify()', function () {
  it('modifies included options of set model', function () {
    const modelName = shortid.generate();
    define(modelName, { clientType: 'test' });
    modify(modelName, { clientType: 'client' });
    assert.equal(models[modelName].clientType, 'client');
  });
  it('throws error if unknown model name is passed', function (done) {
    const modelName = shortid.generate();
    try {
      modify(modelName, { clientType: 'client' });
    } catch (err) {
      done();
    }
  });
});
