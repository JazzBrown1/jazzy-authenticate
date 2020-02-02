'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// eslint-disable-next-line no-unused-vars

const makeDefaults = () => ({
  name: 'Model',
  useSessions: true,
  deserializeTactic: 'always',
  extract: 'body',
  clientType: 'user',
  selfInit: false,
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  initOnError: { status: 500 },
  initOnSuccess: null,
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  authenticateOnSuccess: null,
  checkAuthenticatedOnFail: { status: 401 },
  checkAuthenticatedOnSuccess: null,
  checkUnauthenticatedOnFail: { status: 401 },
  checkUnauthenticatedOnSuccess: null,
  logoutOnSuccess: null,
  deserializeUserOnError: { status: 500 },
  deserializeUserOnSuccess: null,


  selfLogin: false, // deprecated
  checkNotLoggedOnFail: { status: 401 }, // to be superseded by checkAuthentication()
  checkNotLoggedOnSuccess: null, // to be superseded by checkAuthentication()
  checkLoggedOnFail: { status: 401 }, // to be superseded by checkAuthentication()
  checkLoggedOnSuccess: null, // to be superseded by checkAuthentication()
  loginOnSuccess: null, // login() deprecated, this still calls a pass through
});

const models = {
  _default: makeDefaults()
};

models.name = '_default';

const define = (model, options, isDefault) => {
  if (typeof model === 'object') {
    isDefault = options;
    options = model;
    if (!options.name) throw new Error('Model must have a name');
    model = model.name;
  }
  models[model] = { ...makeDefaults(), ...options };
  models[model].name = model;
  models[model].isDefault = isDefault; // is default cannot be declared in options obj
  if (isDefault) {
    models._default = models[model];
  }
};

const modify = (model, options) => {
  if (!models[model]) throw new Error('Cannot modify a model that is not set');
  const { isDefault } = models[model];
  Object.assign(models[model], options);
  models[model].isDefault = isDefault; // cannot overwrite default
};

const makeExtractor = (extract) => {
  if (typeof extract === 'function') return extract;
  return (req, done) => done(null, req[extract]);
};

const redirectEnd = (redirect) => (req, res) => res.redirect(redirect);
const sendEnd = (data) => (req, res) => res.send(data);
const jsonEnd = (json) => (req, res) => res.json(json);
const statusEnd = (status) => (req, res) => res.sendStatus(status);

const makeResponder = (end, type = 'end') => {
  if (typeof end === 'function') return end;
  if (typeof end !== 'object') throw new Error(`Invalid ${type} input, type ${typeof end} - ${end}`);
  if (end.redirect) return redirectEnd(end.redirect);
  if (end.send) return sendEnd(end.send);
  if (end.json) return jsonEnd(end.json);
  if (end.status) return statusEnd(end.status);
  if (end.sendStatus) return statusEnd(end.sendStatus);
  throw new Error(`Invalid ${type} input`);
};

const addEventsToOptions = (options, prefix) => {
  if (options.onFail) options[`${prefix}OnFail`] = options.onFail;
  if (options.onError) options[`${prefix}OnError`] = options.onError;
  if (options.onSuccess) options[`${prefix}OnSuccess`] = options.onSuccess;
  return options;
};

const makeOptionsObject = (modelName, overrides) => {
  if (modelName && !models[modelName]) throw new Error('model is not set');
  return { ...models[modelName || '_default'], ...overrides };
};

const parseOptions = (options) => {
  if (!options.verify) throw new Error('verify is required');
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (!options.getUser) throw new Error('getUser is required');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  return options;
};

const buildOptions = (modelName, overrides, prefix) => {
  const options = makeOptionsObject(modelName, overrides);
  addEventsToOptions(options, prefix);
  parseOptions(options);
  return options;
};

const manualDeserializeInit = (serializedUser, deserialize, done, req) => {
  req.deserializedUser = null;
  done(null, function getUser(cb) {
    if (this.deserializedUser) return cb(null, this.deserializedUser);
    deserialize(this.jazzy.user, (err, deserializedUser2) => {
      this.deserializedUser = deserializedUser2;
      cb(err, deserializedUser2);
    });
  });
};

const manualDeserializeAuth = (d, deserialize) => function getUser(cb) {
  if (this.deserializedUser) return cb(null, this.deserializedUser);
  deserialize(this.jazzy.user, (err, deserializedUser) => {
    this.deserializedUser = deserializedUser;
    cb(err, deserializedUser);
  });
};

const alwaysDeserializeInit = (serializedUser, deserialize, done) => {
  deserialize(serializedUser, done);
};

const alwaysDeserializeAuth = (deserializedUser) => deserializedUser;

const noSessionInit = (options) => {
  if (options.initOnSuccess) {
    const onSuccess = makeResponder(options.initOnSuccess, 'initOnSuccess');
    return (req, res, next) => {
      req.jazzy = { isAuthenticated: false };
      onSuccess(req, res, next);
    };
  }
  return (req, res, next) => {
    req.jazzy = { isAuthenticated: false, auth: {} };
    next();
  };
};

const init = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'init');

  if (!options.useSessions) return noSessionInit(options);

  const { deserialize } = options;
  const onError = makeResponder(options.initOnError, 'initOnError');
  const deserializer = options.deserializeTactic === 'always' ? alwaysDeserializeInit : manualDeserializeInit;

  const initMiddleware = (req, res, next) => {
    if (req.session.jazzy) {
      req.jazzy = req.session.jazzy;
      if (req.jazzy.user) {
        deserializer(req.jazzy.user, deserialize, (err, user) => {
          if (err) onError(req, res, err, next);
          req.user = user;
          next();
        }, req);
      } else next();
    } else {
      req.jazzy = { isAuthenticated: false, auth: {} };
      req.session.jazzy = req.jazzy;
      next();
    }
  };

  if (options.initOnSuccess) return [initMiddleware, makeResponder(options.initOnSuccess, 'initOnSuccess')];
  return initMiddleware;
};

const deserializeUser = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'deserializeUser');
  const onError = makeResponder(options.deserializeUserOnError, 'deserializeUserOnError');
  const deserializeMiddleware = (req, res, next) => {
    if (!req.user) return next();
    req.user((err) => {
      if (err) return onError();
      next();
    });
  };
  if (options.deserializeUserOnSuccess) return [deserializeMiddleware, makeResponder(options.deserializeUserOnSuccess, 'deserializeUserOnSuccess')];
  return deserializeMiddleware;
};

const saveSession = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'saveSession');
  const { serialize } = options;
  return (req, res, next) => {
    serialize(req.deserializedUser, (err, serializedUser) => {
      req.jazzy.user = serializedUser;
      req.session.jazzy = req.jazzy;
      next();
    });
  };
};

const login = (modelName, overrides) => {
  process.emitWarning(
    '`login()` is deprecated `authenticate()` will save session if useSessions is set to true',
    'DeprecationWarning'
  );
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'login');
  if (options.loginOnSuccess) return makeResponder(options.loginOnSuccess);
  return (req, res, next) => next();
};

const logout = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'logout');
  if (!options.useSessions) throw new Error('Cannot use Logout middleware when use sessions set false in model');
  const logoutMiddleware = (req, res, next) => {
    delete req.user;
    req.jazzy = {
      isAuthenticated: false,
      auth: {}
    };
    req.session.jazzy = req.jazzy;
    next();
  };
  if (options.logoutOnSuccess) return [logoutMiddleware, makeResponder(options.logoutOnSuccess, 'logoutOnSuccess')];
  return logoutMiddleware;
};

const authenticate = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'authenticate');
  const {
    verify, getUser, clientType, name, deserialize
  } = options;
  const extract = makeExtractor(options.extract);
  const onError = makeResponder(options.authenticateOnError, 'authenticateOnError');
  const onFail = makeResponder(options.authenticateOnFail, 'authenticateOnFail');
  const deserializer = options.deserializeTactic === 'always' ? alwaysDeserializeAuth : manualDeserializeAuth;

  const authFunction = (req, res, next) => {
    extract(req, (error0, query) => {
      if (error0) return onError(req, res, error0, next);
      getUser(query, (error1, user) => {
        if (error1) return onError(req, res, error1, next);
        if (!user) return onFail(req, res);
        verify(query, user, (error2, result) => {
          if (error2) return onError(req, res, error2, next);
          if (!result) return onFail(req, res);
          req.jazzy.auth[name] = {
            clientType, query, model: name, result
          };
          req.jazzy.isAuthenticated = true;
          req.user = deserializer(user, deserialize);
          req.deserializedUser = user;
          next();
        }, req);
      }, req);
    });
  };

  const middleware = [];
  if (options.selfInit) middleware.push(init(options));
  middleware.push(authFunction);
  if (options.useSessions) middleware.push(saveSession(options));
  if (options.authenticateOnSuccess) middleware.push(makeResponder(options.authenticateOnSuccess, 'authenticateOnSuccess'));
  return middleware.length === 1 ? authFunction : middleware;
};

const checkLogged = (modelName, overrides) => {
  process.emitWarning(
    '`checkLogged()` will be deprecated, use `checkAuthenticated()` instead',
    'DeprecationWarning'
  );
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkLogged');
  const onFail = makeResponder(options.checkLoggedOnFail, 'checkLoggedOnFail');
  if (!options.checkLoggedOnSuccess) {
    return (req, res, next) => {
      if (req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkLoggedOnSuccess, 'checkLoggedOnSuccess');
  return (req, res, next) => {
    if (req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkNotLogged = (modelName, overrides) => {
  process.emitWarning(
    '`checkNotLogged()` will be deprecated, use `checkUnauthenticated()` instead',
    'DeprecationWarning'
  );
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkNotLogged');
  const onFail = makeResponder(options.checkNotLoggedOnFail, 'checkNotLoggedOnFail');
  if (!options.checkNotLoggedOnSuccess) {
    return (req, res, next) => {
      if (!req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkNotLoggedOnSuccess, 'checkNotLoggedOnSuccess');
  return (req, res, next) => {
    if (!req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkAuthenticated = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkAuthenticated');
  const onFail = makeResponder(options.checkAuthenticatedOnFail, 'checkAuthenticatedOnFail');
  if (!options.checkAuthenticatedOnSuccess) {
    return (req, res, next) => {
      if (req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkAuthenticatedOnSuccess, 'checkAuthenticatedOnSuccess');
  return (req, res, next) => {
    if (req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkUnauthenticated = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkUnauthenticated');
  const onFail = makeResponder(options.checkUnauthenticatedOnFail, 'checkUnauthenticatedOnFail');
  if (!options.checkUnauthenticatedOnSuccess) {
    return (req, res, next) => {
      if (!req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkUnauthenticatedOnSuccess, 'checkUnauthenticatedOnSuccess');
  return (req, res, next) => {
    if (!req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

exports.authenticate = authenticate;
exports.checkAuthenticated = checkAuthenticated;
exports.checkLogged = checkLogged;
exports.checkNotLogged = checkNotLogged;
exports.checkUnauthenticated = checkUnauthenticated;
exports.define = define;
exports.deserializeUser = deserializeUser;
exports.init = init;
exports.initiate = init;
exports.login = login;
exports.logout = logout;
exports.modify = modify;
