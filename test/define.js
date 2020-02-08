
var assert = require('assert');
var shortid = require('shortid');
var { define, models } = require('../dist/index');

describe('define()', function () {
  it('should save defined model into models object', function () {
    const modelName = shortid.generate();
    define(modelName, { clientType: 'test' });
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
  });
  it('should save defined model into models object with isDefault set true', function () {
    const modelName = shortid.generate();
    define(modelName, { clientType: 'test' }, true);
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
    assert.equal(models[modelName].isDefault, true);
  });
  it('allows you to omit name argument if name prop passed in options', function () {
    const modelName = shortid.generate();
    define({ name: modelName, clientType: 'test' });
    assert.equal(models[modelName].name, modelName);
    assert.equal(models[modelName].clientType, 'test');
  });
  it('throws an error if no name is passed', function (done) {
    try {
      define({ clientType: 'test' });
    } catch (err) {
      done();
    }
  });
});
