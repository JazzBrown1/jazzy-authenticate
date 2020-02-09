
import { defineModel } from 'jazzy-authenticate';
import { findUserByUserName } from './db';

defineModel(
  'password', // Authentication model name <optional> name prop in options is fine
  { // Authentication Model Options
    extract: 'body', // this will extract req.body for the query can pass a function here (req, done) => done(error, query);
    getUser: (query, done) => findUserByUserName(query.username, done),
    verify: (query, user, done) => done(null, query.password === user.password),
    serialize: (user, done) => done(null, user.username), // don't save passwords in sessions
    deserialize: (user, done) => findUserByUserName(user, done),
    authenticateOnFail: (req, res) => res.render('login', { error: 'Password or username did not match! Try again' }), // Accepts a response object or response function
    authenticateOnSuccess: { redirect: '/' }, // equivalent to "(req, res) => res.redirect('/')"
    logoutOnSuccess: { redirect: '/login' },
    checkAuthenticatedOnFail: (req, res) => res.redirect('/login'),
    checkUnauthenticatedOnFail: { redirect: '/' },
    deserializeTactic: 'never' // req.user is a callback function that only deserializes user when required
  },
  true // Set as default <optional> defaults to false
);
