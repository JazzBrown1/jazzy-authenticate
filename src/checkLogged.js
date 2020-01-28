
/* eslint-disable max-len */
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';

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

export { checkLogged, checkNotLogged };
