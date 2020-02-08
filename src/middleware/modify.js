import models from '../options/models';

const modify = (model, options) => {
  if (!models[model]) throw new Error('Cannot modify a model that is not set');
  const { isDefault } = models[model];
  Object.assign(models[model], options);
  models[model].isDefault = isDefault; // cannot overwrite default
};

export default modify;
