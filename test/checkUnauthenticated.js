var shortid = require('shortid');
const expressChain = require('./expressChain');
var { defineModel, checkUnauthenticated } = require('../dist/index');

describe('checkUnauthenticated()', function () {
  it('should call next when not authenticated', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false
      }
    };
    const res = {};
    defineModel(modelName, { useSessions: false });
    expressChain(checkUnauthenticated(modelName))(req, res, done);
  });
  it('should call onFail when authenticated', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: true,
        auth: {
          someprop: 'value'
        }
      }
    };
    const res = {};
    defineModel(modelName, { useSessions: false, checkUnauthenticatedOnFail: () => done() });
    expressChain(checkUnauthenticated(modelName))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('calls OnSuccess when set', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false
      }
    };
    const res = {};
    defineModel(modelName, { useSessions: false, checkUnauthenticatedOnSuccess: () => done() });
    expressChain(checkUnauthenticated(modelName))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('calls onFail when fails and set and onSuccess is also set', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: true,
        auth: {
          someprop: 'value'
        }
      }
    };
    const res = {};
    defineModel(modelName, {
      useSessions: false,
      checkUnauthenticatedOnSuccess: () => {},
      checkUnauthenticatedOnFail: () => done()
    });
    expressChain(checkUnauthenticated(modelName))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('uses default model when model name not provided', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false
      }
    };
    const res = {};
    defineModel(modelName, {
      useSessions: false,
      checkUnauthenticatedOnSuccess: () => done(),
    }, true);
    expressChain(checkUnauthenticated())(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('allows you to omit model name and pass overrides as first argument', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false
      }
    };
    const res = {};
    defineModel(modelName, {
      useSessions: false,
    }, true);
    expressChain(checkUnauthenticated({ onSuccess: () => done() }))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
});
