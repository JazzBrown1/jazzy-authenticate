/* eslint-disable max-len */
import express, { json, urlencoded } from 'express';
import session from 'express-session';

import {
  define, authenticate, checkAuthenticated, checkUnauthenticated, init, logout
} from 'jazzy-authenticate';

// The users database
const users = {
  j: { username: 'j', password: '' },
  bob: { username: 'bob', password: 'password' },
  dave: { username: 'dave', password: 'password' }
};

// Define the authentication model - If importing routes authentication models must be defined first
define(
  'password', // Authentication model name <optional> name prop in options is fine
  { // Authentication Model Options
    extract: 'body', // this will extract req.body for the query can pass a function here (req, done) => done(error, query);
    getUser: (query, done) => done(null, users[query.username] || false),
    verify: (query, user, done) => done(null, query.password === user.password),
    serialize: (user, done) => done(null, user.username), // don't save passwords in sessions
    deserialize: (user, done) => done(null, users[user]),
    authenticateOnFail: (req, res) => res.render('login', { error: 'Password or username did not match! Try again' }), // Accepts a response object or response function
    authenticateOnSuccess: { redirect: '/' }, // equivalent to "(req, res) => res.redirect('/')"
    logoutOnSuccess: { redirect: '/login' },
    checkAuthenticatedOnFail: (req, res) => res.redirect('/login'),
    checkUnauthenticatedOnFail: { redirect: '/' },
    deserializeTactic: 'never' // req.user is a callback function that only deserializes user when required
  },
  true // Set as default <optional> defaults to false
);

// Make express app
const app = express();

// Use ejs to render pages for demonstrative purposes
app.set('views', `${__dirname}/../ejs`);
app.set('view engine', 'ejs');

// Express body parser middleware
app.use(json({ extended: false }));
app.use(urlencoded({ extended: true }));

// Express session middleware - don't use default sessions in production
app.use(session({
  secret: 'a very secret secret',
  resave: false,
  saveUninitialized: false,
}));

// Initiate jazzy authenticate on the request
app.use(init());

// render home page if logged in
app.get('/', checkAuthenticated(), (req, res) => {
  // Manual deserialize tactic
  req.user((err, user) => {
    if (err) res.sendStatus(500);
    res.render('home', { user });
  });
});

// render login page if not logged in
app.get('/login', checkUnauthenticated(), (req, res) => res.render('login', { error: res.locals.error }));

// logout if not logged in
app.get('/logout', checkAuthenticated(), logout());

// if logged out authenticate the user and login
app.post('/login', checkUnauthenticated(), authenticate());

// Use overrides when you want different fail and success responses for example this api expects a json response
app.get('/api/getDate', checkAuthenticated({ onFail: { json: { error: 'You must be logged in to get the date' } } }), (req, res) => {
  res.json({ date: new Date() });
});

// listen for requests on port 3001 always use https in production
app.listen(3001);
