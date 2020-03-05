import buildOptions from '../options/buildOptions';
import makeResponder from '../options/makeResponder';
import { alwaysDeserializeInit, manualDeserializeInit } from '../options/deserializers';

const noSessionInit = (options) => {
  if (options.initOnSuccess) {
    const onSuccess = makeResponder(options.initOnSuccess, 'initOnSuccess');
    return (req, res, next) => {
      req.jazzy = { isAuthenticated: false };
      onSuccess(req, res, next);
    };
  }
  return (req, res, next) => {
    req.jazzy = { isAuthenticated: false, auth: {} };
    next();
  };
};

const init = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'init');

  if (!options.useSessions) return noSessionInit(options);

  const { deserialize } = options;
  const onError = makeResponder(options.initOnError, 'initOnError');
  const deserializer = options.deserializeTactic === 'always' ? alwaysDeserializeInit : manualDeserializeInit;

  const initMiddleware = (req, res, next) => {
    if (req.session.jazzy) {
      req.jazzy = req.session.jazzy;
      req.deserializedUser = null;
      if (req.jazzy.user) {
        deserializer(req.jazzy.user, deserialize, (err, user) => {
          if (err) onError(req, res, err, next);
          req.user = user;
          next();
        }, req);
      } else next();
    } else {
      req.jazzy = { isAuthenticated: false, auth: {} };
      req.session.jazzy = req.jazzy;
      next();
    }
  };

  if (options.initOnSuccess) return [initMiddleware, makeResponder(options.initOnSuccess, 'initOnSuccess')];
  return initMiddleware;
};

export default init;
