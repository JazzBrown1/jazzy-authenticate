const manualDeserializeInit = (serializedUser, deserialize, done, req) => {
  req.deserializedUser = null;
  done(null, function getUser(cb) {
    if (this.deserializedUser) return cb(null, this.deserializedUser);
    deserialize(this.jazzy.user, (err, deserializedUser2) => {
      this.deserializedUser = deserializedUser2;
      cb(err, deserializedUser2);
    });
  });
};

const manualDeserializeAuth = (d, deserialize) => function getUser(cb) {
  if (this.deserializedUser) return cb(null, this.deserializedUser);
  deserialize(this.jazzy.user, (err, deserializedUser) => {
    this.deserializedUser = deserializedUser;
    cb(err, deserializedUser);
  });
};

const alwaysDeserializeInit = (serializedUser, deserialize, done) => {
  deserialize(serializedUser, done);
};

const alwaysDeserializeAuth = (deserializedUser) => deserializedUser;

export {
  alwaysDeserializeAuth, alwaysDeserializeInit, manualDeserializeAuth, manualDeserializeInit
};
