var shortid = require('shortid');
const assert = require('assert');
const expressChain = require('./expressChain');


var {
  defineModel, init, authenticate, checkAuthenticated, deserializeUser
} = require('../dist/jazzy-auth');


describe('never deserialize tactic', function () {
  it('updates authentication from cookie on new request', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, { useSessions: true, initOnSuccess: null, deserializeTactic: 'never' });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      const request = { session: req.session };
      expressChain([init(modelName), checkAuthenticated(modelName)])(request, res, () => {
        done();
      });
    });
  });
  it('deserializes user by calling user()', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, {
      useSessions: true,
      initOnSuccess: null,
      deserializeTactic: 'never',
      getUser: (q, d) => d(null, 'deserialized'),
      serialize: (q, d) => d(null, 'deserialized'),
      deserialize: (q, d) => d(null, 'deserialized')
    });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      const request = { session: req.session };
      expressChain([init(modelName), checkAuthenticated(modelName)])(request, res, (req2) => {
        req2.user((err, user) => {
          assert.equal(user, 'deserialized');
          req2.user((err2, user2) => {
            done(assert.equal(user2, 'deserialized'));
          });
        });
      });
    });
  });
  it('passes using default deserialize method()', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, {
      useSessions: true,
      initOnSuccess: null,
      deserializeTactic: 'never',
      getUser: (q, d) => d(null, 'user'),
    });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      const request = { session: req.session };
      expressChain([init(modelName), checkAuthenticated(modelName)])(request, res, (req2) => {
        req2.user((err, user) => {
          assert.equal(user, 'user');
          req2.user((err2, user2) => {
            done(assert.equal(user2, 'user'));
          });
        });
      });
    });
  });
  it('deserializes user by using deserializeUser() middleware', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, {
      useSessions: true,
      initOnSuccess: null,
      deserializeTactic: 'never',
      getUser: (q, d) => d(null, 'deserialized'),
      serialize: (q, d) => d(null, 'deserialized'),
      deserialize: (q, d) => d(null, 'deserialized')
    });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      const request = { session: req.session };
      expressChain([
        init(modelName),
        checkAuthenticated(modelName),
        deserializeUser(modelName)
      ])(request, res, (req2) => {
        done(assert.equal(req2.deserializedUser, 'deserialized'));
      });
    });
  });
  describe('deserializeUser()', function () {
    it('deserializes user by using deserializeUser() middleware', function (done) {
      const modelName = shortid.generate();
      const newReq = {
        body: {},
        session: {}
      };
      const res = {};
      defineModel(modelName, {
        useSessions: true,
        initOnSuccess: null,
        deserializeTactic: 'never',
        getUser: (q, d) => d(null, 'deserialized'),
        serialize: (q, d) => d(null, 'deserialized'),
        deserialize: (q, d) => d(null, 'deserialized')
      });
      expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
        const request = { session: req.session };
        expressChain([
          init(modelName),
          checkAuthenticated(modelName),
          deserializeUser(modelName)
        ])(request, res, (req2) => {
          done(assert.equal(req2.deserializedUser, 'deserialized'));
        });
      });
    });
    it('calls onSuccess when set', function (done) {
      const modelName = shortid.generate();
      const newReq = {
        body: {},
        session: {}
      };
      const res = {};
      defineModel(modelName, {
        useSessions: true,
        initOnSuccess: null,
        deserializeTactic: 'never',
        getUser: (q, d) => d(null, 'deserialized'),
        serialize: (q, d) => d(null, 'deserialized'),
        deserialize: (q, d) => d(null, 'deserialized'),
        deserializeUserOnSuccess: (req) => {
          done(assert.equal(req.deserializedUser, 'deserialized'));
        }
      });
      expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
        const request = { session: req.session };
        expressChain([
          init(modelName),
          checkAuthenticated(modelName),
          deserializeUser(modelName)
        ])(request, res, () => {
          throw new Error('This should never happen');
        });
      });
    });
    it('calls onError when deserialize invokes error', function (done) {
      const modelName = shortid.generate();
      const newReq = {
        body: {},
        session: {}
      };
      const res = {};
      defineModel(modelName, {
        useSessions: true,
        initOnSuccess: null,
        deserializeTactic: 'never',
        getUser: (q, d) => d(null, 'deserialized'),
        serialize: (q, d) => d(null, 'deserialized'),
        deserialize: (q, d) => d('error', 'deserialized'),
        deserializeUserOnError: () => done()
      });
      expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
        const request = { session: req.session };
        expressChain([
          init(modelName),
          checkAuthenticated(modelName),
          deserializeUser(modelName)
        ])(request, res, () => {
          throw new Error('This should never happen');
        });
      });
    });
    it('passes to next mw when user is not authed', function (done) {
      const modelName = shortid.generate();
      const request = {
        body: {},
        session: {}
      };
      const res = {};
      defineModel(modelName, {
        useSessions: true,
        initOnSuccess: null,
        deserializeTactic: 'never',
        getUser: (q, d) => d(null, 'deserialized'),
        serialize: (q, d) => d(null, 'serialized'),
        deserialize: (q, d) => d(null, 'deserialized'),
      });
      expressChain([init(modelName), deserializeUser(modelName)])(request, res, () => {
        done();
      });
    });
    it('allows you to omit model name and use default model', function (done) {
      const modelName = shortid.generate();
      const request = {
        body: {},
        session: {}
      };
      const res = {};
      defineModel(modelName, {
        useSessions: true,
        deserializeTactic: 'never',
        getUser: (q, d) => d(null, 'deserialized'),
        serialize: (q, d) => d(null, 'serialized'),
        deserialize: (q, d) => d(null, 'deserialized'),
      });
      expressChain([init(modelName), deserializeUser({
        onSuccess: () => done()
      })])(request, res, () => {
        throw new Error('This should never happen');
      });
    });
  });
  it('returns deserialized user by calling user() after auth', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, {
      useSessions: true,
      initOnSuccess: null,
      deserializeTactic: 'never',
      getUser: (q, d) => d(null, 'deserialized'),
      serialize: (q, d) => d(null, 'deserialized'),
      deserialize: (q, d) => d(null, 'deserialized')
    });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      req.user((err, user) => {
        done(assert.equal(user, 'deserialized'));
      });
    });
  });
});

describe('always deserialize tactic', function () {
  it('updates authentication from session on new request', function (done) {
    const modelName = shortid.generate();
    const newReq = {
      body: {},
      session: {}
    };
    const res = {};
    defineModel(modelName, { useSessions: true, initOnSuccess: null, deserializeTactic: 'always' });
    expressChain([init(modelName), authenticate(modelName)])(newReq, res, (req) => {
      const request = { session: req.session };
      expressChain([init(modelName), checkAuthenticated(modelName)])(request, res, () => {
        done();
      });
    });
  });
});
