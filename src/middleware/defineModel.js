import models from '../options/models';
import makeDefaults from '../options/makeDefaults';

const defineModel = (model, options, isDefault) => {
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

export default defineModel;
