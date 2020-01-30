import buildOptions from './buildOptions';
import makeResponder from './makeResponder';
import { alwaysDeserializeInit, manualDeserializeInit } from './deserializers';

const noSessionInit = (options) => {
  if (options.initOnSuccess) {
    const onSuccess = makeResponder(options.initOnSuccess, 'initOnSuccess');
    return (req, res, next) => {
      req.jazzy = { isLogged: false };
      onSuccess(req, res, next);
    };
  }
  return (req, res, next) => {
    req.jazzy = { isLogged: false };
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
      req.jazzy = { isLogged: false };
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

const login = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'login');
  const { serialize, useSessions } = options;
  if (!useSessions) throw new Error('Cannot use Login middleware when use sessions set false in model');
  const loginMiddleware = (req, res, next) => {
    serialize(req.deserializedUser, (err, serializedUser) => {
      req.jazzy.user = serializedUser;
      req.session.jazzy = req.jazzy;
      next();
    });
  };
  if (options.loginOnSuccess) return [loginMiddleware, makeResponder(options.loginOnSuccess, 'loginOnSuccess')];
  return loginMiddleware;
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
      isLogged: false
    };
    req.session.jazzy = req.jazzy;
    next();
  };
  if (options.logoutOnSuccess) return [logoutMiddleware, makeResponder(options.logoutOnSuccess, 'logoutOnSuccess')];
  return logoutMiddleware;
};

export {
  init, login, logout, deserializeUser
};
