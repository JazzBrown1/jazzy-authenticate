import strategies from './strategies';
import defaultOptions from './defaults';

const noSessionInit = (req, res, next) => {
  req.jazzy = { isLogged: false };
  next();
};

const init = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('strategy is not set');
  strategy = strategy ? strategies[strategy] : {};
  const deserialize = options.deserialize || strategy.deserialize || defaultOptions.deserialize;
  const useSessions = options.useSessions || strategy.useSessions || defaultOptions.useSessions;
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

export { init, login, logout };
