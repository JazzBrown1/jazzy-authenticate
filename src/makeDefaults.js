// eslint-disable-next-line no-unused-vars

const makeDefaults = () => ({
  name: 'Model',
  useSessions: true,
  deserializeTactic: 'always',
  extract: 'body',
  clientType: 'user',
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
  checkAuthenticatedOnFail: { status: 401 },
  checkAuthenticatedOnSuccess: null,
  checkUnauthenticatedOnFail: { status: 401 },
  checkUnauthenticatedOnSuccess: null,
  logoutOnSuccess: null,
  deserializeUserOnError: { status: 500 },
  deserializeUserOnSuccess: null,


  selfLogin: false, // deprecated
  checkNotLoggedOnFail: { status: 401 }, // to be superseded by checkAuthentication()
  checkNotLoggedOnSuccess: null, // to be superseded by checkAuthentication()
  checkLoggedOnFail: { status: 401 }, // to be superseded by checkAuthentication()
  checkLoggedOnSuccess: null, // to be superseded by checkAuthentication()
  loginOnSuccess: null, // login() deprecated, this still calls a pass through
});

export default makeDefaults;
