import makeExtractor from './makeExtractor';
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';
import { init } from './login';

const authenticate = (strategyName, overrides) => {
  if (typeof strategyName === 'object') {
    overrides = strategyName;
    strategyName = null;
  }
  const options = buildOptions(strategyName, overrides, 'authenticate');
  const {
    verify, getUser, clientType, name
  } = options;
  const extract = makeExtractor(options.extract);
  const authenticateOnError = makeResponder(options.authenticateOnError);
  const authenticateOnFail = makeResponder(options.authenticateOnFail);

  const authFunction = (req, res, next) => {
    extract(req, (error0, query) => {
      if (error0) return authenticateOnError(req, res, error0);
      getUser(query, (error1, user) => {
        if (error1) return authenticateOnError(req, res, error1);
        if (!user) return authenticateOnFail(req, res);
        verify(query, user, (error2, result) => {
          if (error2) return authenticateOnError(req, res, error2);
          if (!result) return authenticateOnFail(req, res);
          req.jazzy.auth = {
            user, clientType, query, strategy: name
          };
          req.user = user;
          next();
        });
      });
    });
  };
  if (options.selfInit) return [init(options), authFunction];
  return authFunction;
};

export default authenticate;
