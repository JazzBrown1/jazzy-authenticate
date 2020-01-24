
/* eslint-disable max-len */
import makeResponder from './makeResponder';
import defaultOptions from './defaults';
import strategies from './strategies';

const checkLogged = (strategy, options = {}) => {
  if (typeof strategy === 'object') {
    options = strategy;
    strategy = null;
  }
  if (strategy && !strategies[strategy]) throw new Error('Strategy not set');
  strategy = strategy ? strategies[strategy] : {};
  let onFail = options.onFail || strategy.checkLoggedOnFail || defaultOptions.checkLoggedOnFail;
  let onSuccess = options.onSuccess || strategy.checkLoggedOnSuccess || defaultOptions.checkLoggedOnSuccess;
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
  strategy = strategy ? strategies[strategy] : {};
  let onFail = options.onFail || strategy.checkNotLoggedOnFail || defaultOptions.checkNotLoggedOnFail;
  let onSuccess = options.onSuccess || strategy.checkNotLoggedOnSuccess || defaultOptions.checkNotLoggedOnSuccess;
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

export { checkLogged, checkNotLogged };
