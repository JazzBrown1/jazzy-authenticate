import buildOptions from './buildOptions';
import makeResponder from './makeResponder';

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

export { init, login, logout };
