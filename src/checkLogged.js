
/* eslint-disable max-len */
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';

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

export { checkLogged, checkNotLogged };
