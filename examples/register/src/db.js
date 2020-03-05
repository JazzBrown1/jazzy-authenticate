import shortid from 'shortid';

// The users database
const users = {
  bob: {
    id: 'bob',
    username: 'bob',
    password: {
      hash:
    '3bf1fed3b906fcfaa63053f431eebb742aaa455c232de605ae365c95172c6d6bf18673c5aefbd70456b6224a4fdac081b2ff621a8fe60a6eb61a7625a4ca1ef7',
      salt: '85c027ec2014cc01'
    } // === password
  },
  dave: {
    id: 'dave',
    username: 'dave',
    password: {
      hash:
      '45448fd120124f6d9814c1d934cd7b3c3d6ad1120fbb69c3730c19e686dd0f513d79d194a20811b69d7496ec5ea8e4b5d5084dd1622d78f007281a0887df6d68',
      salt: '610116f31ece378e'
    } // === password
  }
};

const findUserById = (id, cb) => {
  if (!users[id]) return cb(null, null);
  cb(null, users[id]);
};

const findUserByUserName = (username, cb) => {
  const user = Object.keys(users).find((key) => users[key].username === username);
  cb(null, users[user]);
};

const insertUser = (username, password, cb) => {
  findUserByUserName(username, (err, user) => {
    if (user) return cb(null, null);
    const insertedUser = { username, password, id: shortid.generate() };
    users[insertedUser.id] = insertedUser;
    cb(null, insertedUser);
  });
};

export {
  users, findUserByUserName, insertUser, findUserById
};
