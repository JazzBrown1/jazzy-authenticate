import strategies from './strategies';

const addEventsToOptions = (options, prefix) => {
  if (options.onFail) options[`${prefix}OnFail`] = options.onFail;
  if (options.onError) options[`${prefix}OnError`] = options.onError;
  if (options.onSuccess) options[`${prefix}OnSuccess`] = options.onSuccess;
  return options;
};

const makeOptionsObject = (strategyName, overrides) => {
  if (strategyName && !strategies[strategyName]) throw new Error('strategy is not set');
  return { ...strategies[strategyName || '_default'], ...overrides };
};

const parseOptions = (options) => {
  if (!options.verify) throw new Error('verify is required');
  if (typeof options.verify !== 'function') throw new Error('verify must be a function');
  if (!options.getUser) throw new Error('getUser is required');
  if (typeof options.getUser !== 'function') throw new Error('getUser must be a function');
  return options;
};

const buildOptions = (strategyName, overrides, prefix) => {
  const options = makeOptionsObject(strategyName, overrides);
  addEventsToOptions(options, prefix);
  parseOptions(options);
  return options;
};

export default buildOptions;
