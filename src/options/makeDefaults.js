const makeDefaults = () => ({
  name: 'Model',
  useSessions: false,
  deserializeTactic: 'always',
  extract: 'body',
  clientType: 'client',
  selfInit: false,
  getUser: (query, done) => done(null, {}),
  verify: (query, user, done) => done(null, true),
  serialize: (user, done) => done(null, user),
  deserialize: (user, done) => done(null, user),
  initOnError: { status: 500 },
  initOnSuccess: null,
  authenticateOnError: { status: 500 },
  authenticateOnFail: { status: 401 },
  authenticateOnSuccess: null,
  checkAuthenticationOnFail: { status: 401 },
  checkAuthenticationOnSuccess: null,
  checkAuthenticatedOnFail: { status: 401 },
  checkAuthenticatedOnSuccess: null,
  checkUnauthenticatedOnFail: { status: 401 },
  checkUnauthenticatedOnSuccess: null,
  logoutOnSuccess: null,
  deserializeUserOnError: { status: 500 },
  deserializeUserOnSuccess: null
});

export default makeDefaults;
