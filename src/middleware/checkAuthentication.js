import { checkAuthenticatedBasic, checkUnauthenticatedBasic } from './checkAuthenticated';
import buildOptions from '../options/buildOptions';
import makeResponder from '../options/makeResponder';

const checkAuthentication = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'checkAuthentication');
  if (!options.filter && !options.is) throw new Error('checkAuthenticate requires a filter or is property');
  if (options.is) {
    if (options.is === 'authenticated') return checkAuthenticatedBasic(modelName, overrides, 'checkAuthentication');
    if (options.is === 'unauthenticated') return checkUnauthenticatedBasic(modelName, overrides, 'checkAuthentication');
    throw new Error('checkAuthentication is option must be either "authenticated" or "unauthenticated" ');
  }
  const { filter } = options;
  const onFail = makeResponder(options.checkAuthenticationOnFail, 'checkAuthenticationOnFail');

  const middleware = (req, res, next) => {
    if (filter(Object.keys(req.jazzy.auth))) return onFail();
    next();
  };

  if (options.checkAuthenticationOnSuccess) {
    return [
      middleware,
      makeResponder(options.checkAuthenticationOnSuccess, 'checkAuthenticationOnSuccess')
    ];
  }
  return middleware;
};

export default checkAuthentication;
