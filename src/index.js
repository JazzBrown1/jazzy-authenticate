/* eslint-disable max-len */

const strategies = {};

// All Strategy options
const defaultOptions = {
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  useSessions: true,
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  extract: 'body',
  clientType: 'user',
  checkNotLoggedOnFail: { status: 401 },
  checkNotLoggedOnSuccess: null,
  checkLoggedOnFail: { status: 401 },
  checkLoggedOnSuccess: null,
  loginOnSuccess: null,
  logoutOnSuccess: null,
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user)
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
  throw new Error(`Invalid ${type} input`);
};

const makeExtractor = (extract) => {
  if (typeof extract === 'function') return extract;
  return (req) => req[extract];
};

const setStrategy = (strategy, options) => {
  strategies[strategy] = options;
  strategies[strategy].name = strategy;
};

const modifyStrategy = (strategy, options) => {
  strategies[strategy] = { ...strategies[strategy], ...options };
};

const authenticate = (strategy, options) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (options) {
    options.authenticateOnFail = options.onFail;
    options.authenticateOnError = options.onError;
    delete options.onFail;
    delete options.onError;
  } else options = {};
  if (strategy && !strategies[strategy]) throw new Error('strategy is not set');
  options = strategy ? ({ ...defaultOptions, ...strategies[strategy], ...options }) : { ...defaultOptions, ...options };
  if (!options.verify) throw new Error('verify is required');
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (!options.getUser) throw new Error('getUser is required');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  let { authenticateOnError, authenticateOnFail, extract } = options;
  const { verify, getUser, clientType } = options;
  extract = makeExtractor(extract);
  authenticateOnError = makeResponder(authenticateOnError);
  authenticateOnFail = makeResponder(authenticateOnFail);
  return (req, res, next) => {
    const query = extract(req);
    getUser(query, (error, user) => {
      if (error) return authenticateOnError(req, res, error);
      if (!user) return authenticateOnFail(req, res);
      verify(query, user, (error2, result) => {
        if (error2) return authenticateOnError(req, res, error2);
        if (!result) return authenticateOnFail(req, res);
        req.jazzyAuth = {
          user,
          clientType,
          query
        };
        next();
      });
    });
  };
};

const init = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('strategy is not set');
  strategy = strategy ? strategies[strategy] : {};
  const deserialize = options.deserialize || strategy.deserialize || defaultOptions.deserialize;
  return (req, res, next) => {
    req.jazzy = {
      isLogged: false
    };
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
      req.session.jazzy = {
        isLogged: false
      };
      next();
    }
  };
};

const login = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('strategy is not set');
  strategy = strategy ? strategies[strategy] : {};
  const serialize = options.serialize || strategy.serialize || defaultOptions.serialize;
  return (req, res, next) => {
    serialize(req.jazzyAuth.user, (err, serializedUser) => {
      req.user = req.jazzyAuth.user;
      req.jazzy.isLogged = true;
      req.session.jazzy.isLogged = true;
      req.session.jazzy.user = serializedUser;
      next();
    });
  };
};

const logout = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('strategy is not set');
  strategy = strategy ? strategies[strategy] : {};
  const onSuccess = options.onSuccess || strategy.logoutOnSuccess || defaultOptions.logoutOnSuccess;
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

const checkLogged = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('Strategy not set');
  if (strategy) strategy = strategies[strategy];
  let onFail = options.onFail || ((strategy && strategy.checkLoggedOnFail) ? strategy.checkLoggedOnFail : defaultOptions.checkLoggedOnFail);
  let onSuccess = options.onSuccess || ((strategy && strategy.checkLoggedOnSuccess) ? strategy.checkLoggedOnSuccess : defaultOptions.checkLoggedOnSuccess);
  onFail = makeResponder(onFail, 'onFail');
  if (!onSuccess) {
    return (req, res, next) => {
      if (req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  onSuccess = makeResponder(onSuccess);
  return (req, res) => {
    if (req.jazzy.isLogged) return onSuccess(req, res);
    onFail(req, res);
  };
};

const checkNotLogged = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('Strategy not set');
  if (strategy) strategy = strategies[strategy];
  let onFail = options.onFail || ((strategy && strategy.checkNotLoggedOnFail) ? strategy.checkNotLoggedOnFail : defaultOptions.checkNotLoggedOnFail);
  let onSuccess = options.onSuccess || ((strategy && strategy.checkNotLoggedOnSuccess) ? strategy.checkNotLoggedOnSuccess : defaultOptions.checkNotLoggedOnSuccess);
  onFail = makeResponder(onFail, 'onFail');
  if (!onSuccess) {
    return (req, res, next) => {
      if (!req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  onSuccess = makeResponder(onSuccess);
  return (req, res) => {
    if (!req.jazzy.isLogged) return onSuccess(req, res);
    onFail(req, res);
  };
};

export {
  authenticate, setStrategy, modifyStrategy, login, logout, init, checkLogged, checkNotLogged
};
