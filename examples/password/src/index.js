import express, { json, urlencoded } from 'express';
import session from 'express-session';

import {
  authenticate, checkAuthenticated, checkUnauthenticated, init, logout
} from 'jazzy-authenticate';

import './password.model';

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

// Use overrides when you want different fail and success responses for example this endpoint
// sends a json response
app.get('/api/getDate', checkAuthenticated({
  onFail: { json: { error: 'You must be logged in to get the date' } }
}), (req, res) => {
  res.json({ date: new Date() });
});

// listen for requests on port 3001 always use https in production
app.listen(3001);
