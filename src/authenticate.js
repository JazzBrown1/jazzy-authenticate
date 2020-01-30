import makeExtractor from './makeExtractor';
import makeResponder from './makeResponder';
import buildOptions from './buildOptions';
import { init, login } from './login';
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
          req.jazzy.auth = {
            clientType, query, model: name, result
          };
          req.jazzy.isLogged = true;
          req.user = deserializer(user, deserialize, req);
          req.deserializedUser = user;
          next();
        }, req);
      }, req);
    });
  };
  const middleware = [authFunction];
  if (options.selfInit) middleware.pop(init(options));
  if (options.selfLogin) middleware.push(login(options));
  if (options.authenticateOnSuccess) middleware.push(makeResponder(options.authenticateOnSuccess, 'authenticateOnSuccess'));
  return middleware.length === 1 ? authFunction : middleware;
};

export default authenticate;
