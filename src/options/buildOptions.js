import models from './models';

const addEventsToOptions = (options, prefix) => {
  if (options.onFail) options[`${prefix}OnFail`] = options.onFail;
  if (options.onError) options[`${prefix}OnError`] = options.onError;
  if (options.onSuccess) options[`${prefix}OnSuccess`] = options.onSuccess;
  return options;
};

const makeOptionsObject = (modelName, overrides) => {
  if (modelName && !models[modelName]) throw new Error('model is not set');
  return { ...models[modelName || '_default'], ...overrides };
};

const parseOptions = (options) => {
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  return options;
};

const buildOptions = (modelName, overrides, prefix) => {
  const options = makeOptionsObject(modelName, overrides);
  addEventsToOptions(options, prefix);
  parseOptions(options);
  return options;
};

export default buildOptions;
