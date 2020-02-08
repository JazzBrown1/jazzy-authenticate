var shortid = require('shortid');
const expressChain = require('./expressChain');
var { define, checkAuthenticated } = require('../dist/index');

describe('checkAuthenticated()', function () {
  it('should call next when authenticated', function (done) {
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
    define(modelName, { useSessions: false });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });
  it('should call onFail when unauthenticated', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false
      }
    };
    const res = {};
    define(modelName, { useSessions: false, checkAuthenticatedOnFail: () => done() });
    expressChain(checkAuthenticated(modelName))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('calls onFail when fails and set and onSuccess is also set', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      jazzy: {
        isAuthenticated: false,
      }
    };
    const res = {};
    define(modelName, {
      useSessions: false,
      checkAuthenticatedOnSuccess: () => {},
      checkAuthenticatedOnFail: () => done()
    });
    expressChain(checkAuthenticated(modelName))(req, res, () => {
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
    define(modelName, {
      useSessions: false,
      checkAuthenticatedOnFail: () => done(),
    }, true);
    expressChain(checkAuthenticated())(req, res, () => {
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
    define(modelName, {
      useSessions: false,
    }, true);
    expressChain(checkAuthenticated({ onFail: () => done() }))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
});
