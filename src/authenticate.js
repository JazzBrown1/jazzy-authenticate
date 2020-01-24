
/* eslint-disable max-len */

import makeExtractor from './makeExtractor';
import makeResponder from './makeResponder';
import defaultOptions from './defaults';
import strategies from './strategies';

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
  strategy = strategy ? strategies[strategy] : {};
  options = { ...defaultOptions, ...strategy, ...options };
  if (!options.verify) throw new Error('verify is required');
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (!options.getUser) throw new Error('getUser is required');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  let { authenticateOnError, authenticateOnFail, extract } = options;
  const {
    verify, getUser, clientType, name
  } = options;
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
        req.jazzy.auth = {
          user, clientType, query, strategy: name
        };
        next();
      });
    });
  };
};

export default authenticate;
