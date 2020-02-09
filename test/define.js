
var assert = require('assert');
var shortid = require('shortid');
var { defineModel, models } = require('../dist/index');

describe('defineModel()', function () {
  it('should save defineModeld model into models object', function () {
    const modelName = shortid.generate();
    defineModel(modelName, { clientType: 'test' });
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
  });
  it('should save defineModeld model into models object with isDefault set true', function () {
    const modelName = shortid.generate();
    defineModel(modelName, { clientType: 'test' }, true);
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
    assert.equal(models[modelName].isDefault, true);
  });
  it('allows you to omit name argument if name prop passed in options', function () {
    const modelName = shortid.generate();
    defineModel({ name: modelName, clientType: 'test' });
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
  });
  it('throws an error if no name is passed', function (done) {
    try {
      defineModel({ clientType: 'test' });
    } catch (err) {
      done();
    }
  });
});
