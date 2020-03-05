const manualDeserializeInit = (serializedUser, deserialize, done) => {
  done(null, function getUser(cb) {
    if (this.deserializedUser) return cb(null, this.deserializedUser);
    deserialize(this.jazzy.user, (err, deserializedUser2) => {
      this.deserializedUser = deserializedUser2;
      cb(err, deserializedUser2);
    });
  });
};

const manualDeserializeAuth = () => function getUser(cb) { cb(null, this.deserializedUser); };

const alwaysDeserializeInit = (serializedUser, deserialize, done, req) => {
  deserialize(serializedUser, (err, user) => {
    req.deserializedUser = user;
    done(err, user);
  });
};

const alwaysDeserializeAuth = (deserializedUser) => deserializedUser;

export {
  alwaysDeserializeAuth, alwaysDeserializeInit, manualDeserializeAuth, manualDeserializeInit
};
