import strategies from './strategies';
import makeDefaults from './makeDefaults';

const define = (strategy, options, isDefault) => {
  strategies[strategy] = { ...makeDefaults(), ...options };
  strategies[strategy].name = strategy;
  strategies[strategy].isDefault = isDefault; // is default cannot be declared in options obj
  if (isDefault) {
    strategies._default = strategies[strategy];
  }
};

const modify = (strategy, options) => {
  if (!strategies[strategy]) throw new Error('Cannot modify a strategy that is not set');
  const { isDefault } = strategies[strategy];
  strategies[strategy] = { ...strategies[strategy], ...options };
  strategies[strategy].isDefault = isDefault; // cannot overwrite default
};

export { define, modify };
