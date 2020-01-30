
/* eslint-disable max-len */
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';

const checkLogged = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkLogged');
  const onFail = makeResponder(options.checkLoggedOnFail, 'checkLoggedOnFail');
  if (!options.checkLoggedOnSuccess) {
    return (req, res, next) => {
      if (req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkLoggedOnSuccess, 'checkLoggedOnSuccess');
  return (req, res, next) => {
    if (req.jazzy.isLogged) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkNotLogged = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkNotLogged');
  const onFail = makeResponder(options.checkNotLoggedOnFail, 'checkNotLoggedOnFail');
  if (!options.checkNotLoggedOnSuccess) {
    return (req, res, next) => {
      if (!req.jazzy.isLogged) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options.checkNotLoggedOnSuccess, 'checkNotLoggedOnSuccess');
  return (req, res, next) => {
    if (!req.jazzy.isLogged) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

export { checkLogged, checkNotLogged };
