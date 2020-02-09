
var assert = require('assert');
var shortid = require('shortid');
var { defineModel, models, modifyModel } = require('../dist/index');

describe('modifyModel()', function () {
  it('modifies included options of set model', function () {
    const modelName = shortid.generate();
    defineModel(modelName, { clientType: 'test' });
    modifyModel(modelName, { clientType: 'client' });
    assert.equal(models[modelName].clientType, 'client');
  });
  it('throws error if unknown model name is passed', function (done) {
    const modelName = shortid.generate();
    try {
      modifyModel(modelName, { clientType: 'client' });
    } catch (err) {
      done();
    }
  });
});
