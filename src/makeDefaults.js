const makeDefaults = () => ({
  name: 'Model',
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  useSessions: true,
  extract: 'body',
  clientType: 'user',
  initOnSuccess: null,
  initOnError: { status: 500 },
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  authenticateOnSuccess: null,
  checkNotLoggedOnFail: { status: 401 },
  checkNotLoggedOnSuccess: null,
  checkLoggedOnFail: { status: 401 },
  checkLoggedOnSuccess: null,
  loginOnSuccess: null,
  logoutOnSuccess: null,
  selfInit: false,
  selfLogin: false,
  deserializeUserOnError: { status: 500 },
  deserializeUserOnSuccess: null,
  deserializeTactic: 'always'
});

export default makeDefaults;
