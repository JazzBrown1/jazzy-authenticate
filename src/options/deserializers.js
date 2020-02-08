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

const manualDeserializeAuth = (d) => (cb) => cb(null, d);

const alwaysDeserializeInit = (serializedUser, deserialize, done) => {
  deserialize(serializedUser, done);
};

const alwaysDeserializeAuth = (deserializedUser) => deserializedUser;

export {
  alwaysDeserializeAuth, alwaysDeserializeInit, manualDeserializeAuth, manualDeserializeInit
};
