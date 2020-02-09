
var assert = require('assert');
var shortid = require('shortid');
var { defineModel, logout } = require('../dist/index');
const expressChain = require('./expressChain');

describe('logout()', function () {
  it('removes auth and updates isAuthenticated prop', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      session: {
        jazzy: {
          isAuthenticated: true,
          user: 'someUser',
          auth: {
            someModel: {
              someProp: 'prop'
            }
          }
        }
      }
    };
    defineModel(modelName, { useSessions: true });
    const res = {};
    logout(modelName)(req, res, () => {
      assert.equal(req.jazzy.isAuthenticated, false);
      assert.equal(Object.keys(req.jazzy.auth).length, 0);
      done();
    });
  });
  it('throws error if use sessions set to false', function (done) {
    const modelName = shortid.generate();
    defineModel(modelName, { useSessions: false });
    try { logout(modelName); } catch (err) { done(); }
  });
  it('calls onSuccess() if set', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      session: {
        jazzy: {
          isAuthenticated: true,
          user: 'someUser',
          auth: {
            someModel: {
              someProp: 'prop'
            }
          }
        }
      }
    };
    defineModel(modelName, { useSessions: true, onSuccess: () => done() });
    const res = {};
    expressChain(logout(modelName))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('uses default model if model name is not passed', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      session: {
        jazzy: {
          isAuthenticated: true,
          user: 'someUser',
          auth: {
            someModel: {
              someProp: 'prop'
            }
          }
        }
      }
    };
    defineModel(modelName, { useSessions: true, onSuccess: () => done() }, true);
    const res = {};
    expressChain(logout())(req, res, () => {
      throw new Error('this should never happen');
    });
  });
  it('uses overrides if passed as first argument', function (done) {
    const modelName = shortid.generate();
    const req = {
      body: {},
      session: {
        jazzy: {
          isAuthenticated: true,
          user: 'someUser',
          auth: {
            someModel: {
              someProp: 'prop'
            }
          }
        }
      }
    };
    defineModel(modelName, { useSessions: true });
    const res = {};
    expressChain(logout({ onSuccess: () => done() }))(req, res, () => {
      throw new Error('this should never happen');
    });
  });
});
