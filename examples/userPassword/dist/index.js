'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = require('express');
var express__default = _interopDefault(express);
var session = _interopDefault(require('express-session'));
var jazzyAuthenticate = require('jazzy-authenticate');

/* eslint-disable max-len */

// The users database
const users = {
  j: { username: 'j', password: '' },
  bob: { username: 'bob', password: 'password' },
  dave: { username: 'dave', password: 'password' }
};

// Define the authentication model - If importing routes authentication models must be defined first
jazzyAuthenticate.define(
  'password', // Authentication model name <optional> name prop in options is fine
  { // Authentication Model Options
    extract: 'body', // this will extract req.body for the query can pass a function here (req, done) => done(error, query);
    getUser: (query, done) => done(null, users[query.username] || false),
    verify: (query, user, done) => done(null, query.password === user.password),
    serialize: (user, done) => done(null, user.username), // don't save passwords in sessions
    deserialize: (user, done) => done(null, users[user]),
    authenticateOnFail: (req, res) => res.render('login', { error: 'Password or username did not match! Try again' }), // Accepts a response object or response function
    loginOnSuccess: { redirect: '/' }, // equivalent to "(req, res) => res.redirect('/')"
    logoutOnSuccess: { redirect: '/login' },
    checkLoggedOnFail: (req, res) => res.redirect('/login'),
    checkNotLoggedOnFail: { redirect: '/' },
    deserializeTactic: 'never' // req.user is a callback function that only deserializes user when required
  },
  true // Set as default <optional> defaults to false
);

// Make express app
const app = express__default();

// Use ejs to render pages for demonstrative purposes
app.set('views', `${__dirname}/../ejs`);
app.set('view engine', 'ejs');

// Express body parser middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

// Express session middleware - don't use default sessions in production
app.use(session({
  secret: 'a very secret secret',
  resave: false,
  saveUninitialized: false,
}));

// Initiate jazzy authenticate on the request
app.use(jazzyAuthenticate.init());

// render home page if logged in
app.get('/', jazzyAuthenticate.checkLogged(), (req, res) => {
  // Manual deserialize tactic
  req.user((err, user) => {
    if (err) res.sendStatus(500);
    res.render('home', { user });
  });
});

// render login page if not logged in
app.get('/login', jazzyAuthenticate.checkNotLogged(), (req, res) => res.render('login', { error: res.locals.error }));

// logout if not logged in
app.get('/logout', jazzyAuthenticate.checkLogged(), jazzyAuthenticate.logout());

// if logged out authenticate the user and login
app.post('/login', jazzyAuthenticate.checkNotLogged(), jazzyAuthenticate.authenticate(), jazzyAuthenticate.login());

// Use overrides when you want different fail and success responses for example this api expects a json response
app.get('/api/getDate', jazzyAuthenticate.checkLogged({ onFail: { json: { error: 'You must be logged in to get the date' } } }), (req, res) => {
  res.json({ date: new Date() });
});

// listen for requests on port 3001 always use https in production
app.listen(3001);
