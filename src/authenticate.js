import makeExtractor from './makeExtractor';
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';
import { init, saveSession } from './login';
import { alwaysDeserializeAuth, manualDeserializeAuth } from './deserializers';

const authenticate = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'authenticate');
  const {
    verify, getUser, clientType, name, deserialize
  } = options;
  const extract = makeExtractor(options.extract);
  const onError = makeResponder(options.authenticateOnError, 'authenticateOnError');
  const onFail = makeResponder(options.authenticateOnFail, 'authenticateOnFail');
  const deserializer = options.deserializeTactic === 'always' ? alwaysDeserializeAuth : manualDeserializeAuth;

  const authFunction = (req, res, next) => {
    extract(req, (error0, query) => {
      if (error0) return onError(req, res, error0, next);
      getUser(query, (error1, user) => {
        if (error1) return onError(req, res, error1, next);
        if (!user) return onFail(req, res);
        verify(query, user, (error2, result) => {
          if (error2) return onError(req, res, error2, next);
          if (!result) return onFail(req, res);
          req.jazzy.auth[name] = {
            clientType, query, model: name, result
          };
          req.jazzy.isAuthenticated = true;
          req.user = deserializer(user, deserialize);
          req.deserializedUser = user;
          next();
        }, req);
      }, req);
    });
  };

  const middleware = [];
  if (options.selfInit) middleware.push(init(options));
  middleware.push(authFunction);
  if (options.useSessions) middleware.push(saveSession(options));
  if (options.authenticateOnSuccess) middleware.push(makeResponder(options.authenticateOnSuccess, 'authenticateOnSuccess'));
  return middleware.length === 1 ? authFunction : middleware;
};

export default authenticate;
