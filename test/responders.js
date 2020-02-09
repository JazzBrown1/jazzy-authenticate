var shortid = require('shortid');
const expressChain = require('./expressChain');
var { defineModel, checkAuthenticated } = require('../dist/index');

describe('responders', function () {
  it('should call res.send and checkAuthenticatedOnSuccess send response set when authenticated', function (done) {
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
    const res = {
      send: () => done()
    };
    defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { send: 'test' } });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });

  it('should call res.json and checkAuthenticatedOnSuccess send response set when authenticated', function (done) {
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
    const res = {
      json: () => done()
    };
    defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { json: { test: 'test' } } });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });
  it('calls res.sendStatus and sendStatus send response set when authenticated', function (done) {
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
    const res = {
      sendStatus: () => done()
    };
    defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { sendStatus: 200 } });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });
  it('calls res.sendStatus and sendStatus status response set when authenticated', function (done) {
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
    const res = {
      sendStatus: () => done()
    };
    defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { status: 200 } });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });
  it('calls res.redirect and sendStatus status response set when authenticated', function (done) {
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
    const res = {
      redirect: () => done()
    };
    defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { redirect: 200 } });
    expressChain(checkAuthenticated(modelName))(req, res, done);
  });
  it('throws an error if non object or function is set', function (done) {
    const modelName = shortid.generate();
    try {
      defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: 'should cause error' });
      checkAuthenticated(modelName);
    } catch (err) {
      done();
    }
  });
  it('throws an error unknown responder prop is set', function (done) {
    const modelName = shortid.generate();
    try {
      defineModel(modelName, { useSessions: false, checkAuthenticatedOnSuccess: { should_cause: ' error' } });
      checkAuthenticated(modelName);
    } catch (err) {
      done();
    }
  });
  it('allow props without prefix when passed to middleware is set', function () {
    const modelName = shortid.generate();
    defineModel(modelName, { useSessions: false });
    checkAuthenticated(modelName, { onFail: { redirect: ' /' }, onError: { redirect: ' /' }, onSuccess: { redirect: ' /' } });
  });
});
