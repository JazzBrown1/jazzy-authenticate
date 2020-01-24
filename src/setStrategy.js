import strategies from './strategies';
import defaultOptions from './defaults';

const setStrategy = (strategy, options, isDefault) => {
  strategies[strategy] = { ...options };
  strategies[strategy].name = strategy;
  strategies[strategy].isDefault = false; // is default cannot be declared in options obj
  if (isDefault) {
    Object.assign(defaultOptions, options, { isDefault: true });
    strategies[strategy].isDefault = true;
  }
};

const modifyStrategy = (strategy, options) => {
  strategies[strategy] = { ...strategies[strategy], ...options };
  strategies[strategy].isDefault = false;
  if (strategies[strategy].isDefault) {
    Object.assign(defaultOptions, options, { isDefault: true });
    strategies[strategy].isDefault = true;
  }
};

export { setStrategy, modifyStrategy };
