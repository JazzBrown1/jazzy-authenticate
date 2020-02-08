
const saveSession = (overrides) => {
  const { serialize } = overrides;
  return (req, res, next) => {
    serialize(req.deserializedUser, (err, serializedUser) => {
      req.jazzy.user = serializedUser;
      req.session.jazzy = req.jazzy;
      next();
    });
  };
};

export default saveSession;
