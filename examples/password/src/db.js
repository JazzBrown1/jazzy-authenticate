// The users database
const users = {
  bob: { username: 'bob', password: 'password' },
  dave: { username: 'dave', password: 'password' }
};

const findUserByUserName = (username, cb) => {
  if (!users[username]) return cb(null, null);
  cb(null, users[username]);
};

export { users, findUserByUserName };
