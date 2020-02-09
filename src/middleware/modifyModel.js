import models from '../options/models';

const modifyModel = (model, options) => {
  if (!models[model]) throw new Error('Cannot modifyModel a model that is not set');
  const { isDefault } = models[model];
  Object.assign(models[model], options);
  models[model].isDefault = isDefault; // cannot overwrite default
};

export default modifyModel;
