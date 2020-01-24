import strategies from './strategies';

const setStrategy = (strategy, options) => {
  strategies[strategy] = options;
  strategies[strategy].name = strategy;
};

const modifyStrategy = (strategy, options) => {
  strategies[strategy] = { ...strategies[strategy], ...options };
};

export { setStrategy, modifyStrategy };
