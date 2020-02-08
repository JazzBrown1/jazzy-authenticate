
/* eslint-disable max-len */
import makeResponder from '../options/makeResponder';
import buildOptions from '../options/buildOptions';

const checkAuthenticatedBasic = (modelName, overrides, wrapperName) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const onFailOption = `${wrapperName}OnFail`;
  const onSuccessOption = `${wrapperName}OnSuccess`;
  const options = buildOptions(modelName, overrides, wrapperName);
  const onFail = makeResponder(options[onFailOption], onFailOption);
  if (!options[onSuccessOption]) {
    return (req, res, next) => {
      if (req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options[onSuccessOption], onSuccessOption);
  return (req, res, next) => {
    if (req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkUnauthenticatedBasic = (modelName, overrides, wrapperName) => {
  if (typeof modelName === 'object') {
    overrides = modelName;
    modelName = null;
  }
  const onFailOption = `${wrapperName}OnFail`;
  const onSuccessOption = `${wrapperName}OnSuccess`;
  const options = buildOptions(modelName, overrides, wrapperName);
  const onFail = makeResponder(options[onFailOption], onFailOption);
  if (!options[onSuccessOption]) {
    return (req, res, next) => {
      if (!req.jazzy.isAuthenticated) return next();
      onFail(req, res);
    };
  }
  const onSuccess = makeResponder(options[onSuccessOption], onSuccessOption);
  return (req, res, next) => {
    if (!req.jazzy.isAuthenticated) return onSuccess(req, res, next);
    onFail(req, res);
  };
};

const checkAuthenticated = (s, o) => checkAuthenticatedBasic(s, o, 'checkAuthenticated');
const checkUnauthenticated = (s, o) => checkUnauthenticatedBasic(s, o, 'checkUnauthenticated');

export {
  checkAuthenticated, checkUnauthenticated, checkAuthenticatedBasic, checkUnauthenticatedBasic
};
