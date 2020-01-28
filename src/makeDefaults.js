const makeDefaults = () => ({
  name: 'Strategy',
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  useSessions: true,
  extract: 'body',
  clientType: 'user',
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  checkNotLoggedOnFail: { status: 401 },
  checkNotLoggedOnSuccess: null,
  checkLoggedOnFail: { status: 401 },
  checkLoggedOnSuccess: null,
  loginOnSuccess: null,
  logoutOnSuccess: null,
  selfInit: false
});

export default makeDefaults;
