import buildOptions from '../options/buildOptions';
import makeResponder from '../options/makeResponder';

const logout = (modelName, overrides) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const options = buildOptions(modelName, overrides, 'logout');
  if (!options.useSessions) throw new Error('Cannot use Logout middleware when use sessions set false in model');
  const logoutMiddleware = (req, res, next) => {
    delete req.user;
    req.jazzy = {
      isAuthenticated: false,
      auth: {}
    };
    req.session.jazzy = req.jazzy;
    next();
  };
  if (options.logoutOnSuccess) return [logoutMiddleware, makeResponder(options.logoutOnSuccess, 'logoutOnSuccess')];
  return logoutMiddleware;
};

export default logout;
