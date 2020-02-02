
/* eslint-disable max-len */
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';

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

export { checkAuthenticated, checkUnauthenticated };
