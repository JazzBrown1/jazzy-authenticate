'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const makeDefaults = () => ({
  name: 'Strategy',
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  useSessions: true,
  extract: 'body',
  clientType: 'user',
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  checkNotLoggedOnFail: { status: 401 },
  checkNotLoggedOnSuccess: null,
  checkLoggedOnFail: { status: 401 },
  checkLoggedOnSuccess: null,
  loginOnSuccess: null,
  logoutOnSuccess: null,
  selfInit: false
});

const strategies = {
  _default: makeDefaults()
};

strategies.name = '_default';

const define = (strategy, options, isDefault) => {
  strategies[strategy] = { ...makeDefaults(), ...options };
  strategies[strategy].name = strategy;
  strategies[strategy].isDefault = isDefault; // is default cannot be declared in options obj
  if (isDefault) {
    strategies._default = strategies[strategy];
  }
};

const modify = (strategy, options) => {
  if (!strategies[strategy]) throw new Error('Cannot modify a strategy that is not set');
  const { isDefault } = strategies[strategy];
  strategies[strategy] = { ...strategies[strategy], ...options };
  strategies[strategy].isDefault = isDefault; // cannot overwrite default
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

const makeOptionsObject = (strategyName, overrides) => {
  if (strategyName && !strategies[strategyName]) throw new Error('strategy is not set');
  return { ...strategies[strategyName || '_default'], ...overrides };
};

const parseOptions = (options) => {
  if (!options.verify) throw new Error('verify is required');
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (!options.getUser) throw new Error('getUser is required');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  return options;
};

const buildOptions = (strategyName, overrides, prefix) => {
  const options = makeOptionsObject(strategyName, overrides);
  addEventsToOptions(options, prefix);
  parseOptions(options);
  return options;
};

const noSessionInit = (req, res, next) => {
  req.jazzy = { isLogged: false };
  next();
};

const init = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'na');
  const { deserialize, useSessions } = options;
  if (!useSessions) return noSessionInit;
  return (req, res, next) => {
    req.jazzy = { isLogged: false };
    if (req.session.jazzy) {
      req.jazzy.isLogged = req.session.jazzy.isLogged;
      if (req.session.jazzy.user) {
        deserialize(req.session.jazzy.user, (err, user) => {
          req.jazzy.user = user;
          req.user = user;
          next();
        });
      } else next();
    } else {
      req.session.jazzy = { isLogged: false };
      next();
    }
  };
};

const login = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'login');
  const { serialize, useSessions } = options;
  if (!useSessions) throw new Error('Cannot use Login middleware when use sessions set false in strategy');
  return (req, res, next) => {
    serialize(req.jazzy.auth.user, (err, serializedUser) => {
      req.jazzy.isLogged = true;
      req.session.jazzy.isLogged = true;
      req.session.jazzy.user = serializedUser;
      next();
    });
  };
};

const logout = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'logout');
  if (!options.useSessions) throw new Error('Cannot use Logout middleware when use sessions set false in strategy');
  const onSuccess = makeResponder(options.onSuccess);
  return (req, res, next) => {
    req.session.jazzy = { isLogged: false };
    delete req.user;
    req.jazzy = {
      isLogged: false
    };
    if (onSuccess) return onSuccess();
    next();
  };
};

const authenticate = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'authenticate');
  const {
    verify, getUser, clientType, name
  } = options;
  const extract = makeExtractor(options.extract);
  const authenticateOnError = makeResponder(options.authenticateOnError);
  const authenticateOnFail = makeResponder(options.authenticateOnFail);

  const authFunction = (req, res, next) => {
    extract(req, (error0, query) => {
      if (error0) return authenticateOnError(req, res, error0);
      getUser(query, (error1, user) => {
        if (error1) return authenticateOnError(req, res, error1);
        if (!user) return authenticateOnFail(req, res);
        verify(query, user, (error2, result) => {
          if (error2) return authenticateOnError(req, res, error2);
          if (!result) return authenticateOnFail(req, res);
          req.jazzy.auth = {
            user, clientType, query, strategy: name
          };
          req.user = user;
          next();
        });
      });
    });
  };
  if (options.selfInit) return [init(options), authFunction];
  return authFunction;
};

const checkLogged = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'checkLogged');
  const onFail = makeResponder(options.onFail, 'onFail');
  if (!options.onSuccess) {
    return (req, res, next) => {
      if (req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.onSuccess);
  return (req, res) => {
    if (req.jazzy.isLogged) return onSuccess(req, res);
    onFail(req, res);
  };
};

const checkNotLogged = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'checkNotLogged');
  const onFail = makeResponder(options.onFail, 'onFail');
  if (!options.onSuccess) {
    return (req, res, next) => {
      if (!req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.onSuccess);
  return (req, res) => {
    if (!req.jazzy.isLogged) return onSuccess(req, res);
    onFail(req, res);
  };
};

exports.authenticate = authenticate;
exports.checkLogged = checkLogged;
exports.checkNotLogged = checkNotLogged;
exports.define = define;
exports.init = init;
exports.login = login;
exports.logout = logout;
exports.modify = modify;
exports.setStrategy = define;
