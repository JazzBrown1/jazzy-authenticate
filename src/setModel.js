import models from './models';
import makeDefaults from './makeDefaults';

const define = (model, options, isDefault) => {
  if (typeof model === 'object') {
    isDefault = options;
    options = model;
    if (!options.name) throw new Error('Model must have a name');
    model = model.name;
  }
  models[model] = { ...makeDefaults(), ...options };
  models[model].name = model;
  models[model].isDefault = isDefault; // is default cannot be declared in options obj
  if (isDefault) {
    models._default = models[model];
  }
};

const modify = (model, options) => {
  if (!models[model]) throw new Error('Cannot modify a model that is not set');
  const { isDefault } = models[model];
  Object.assign(models[model], options);
  models[model].isDefault = isDefault; // cannot overwrite default
};

export { define, modify };
