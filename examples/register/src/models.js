
import { defineModel } from 'jazzy-authenticate';
import { findUserByUserName, insertUser, findUserById } from './db';

import pw from './jazzy-password';

const serialize = (user, done) => done(null, user.id);

defineModel(
  'password',
  {
    useSessions: true,
    deserializeTactic: 'always',
    extract: 'body',
    getUser: (query, done) => findUserByUserName(query.username, done),
    verify: (query, user, done) => {
      done(
        null,
        pw.check(query.password, user.password)
      );
    },
    serialize,
    deserialize: (id, done) => findUserById(id, done),
    authenticateOnError: (req, res) => res.render('login', { error: 'internal server error' }),
    authenticateOnFail: (req, res) => res.render('login', { error: 'Password or username did not match! Try again' }),
    authenticateOnSuccess: (req, res) => res.render('success', { message: 'Log in successful', user: req.user }),
    logoutOnSuccess: { redirect: '/login' },
    checkAuthenticatedOnFail: (req, res) => res.redirect('/login'),
    checkUnauthenticatedOnFail: { redirect: '/' }
  },
  true // Set as default <optional> defaults to false
);

defineModel('password_register', {
  useSessions: true,
  deserializeTactic: 'always',
  extract: (req, done) => {
    const query = req.body;
    if (typeof query.username !== 'string' || query.username.length === 0) {
      return done(null, false, 'You must specify a username');
    }
    done(null, query);
  },
  getUser: (query, done) => {
    const password = pw.hash(query.password);
    insertUser(query.username, password, (err, insertedUser) => {
      if (err) return done(err);
      if (!insertedUser) return done(null, false, 'username already registered');
      done(null, insertedUser);
    });
  },
  serialize,
  authenticateOnError: (req, res) => res.render('register', { error: 'internal server error' }),
  authenticateOnFail: (req, res, reason) => res.render('register', { error: reason }),
  authenticateOnSuccess: (req, res) => res.render('success', { message: 'Registration successful', user: req.user }),
});
