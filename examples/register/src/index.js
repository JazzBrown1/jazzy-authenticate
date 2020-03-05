import express, { json, urlencoded } from 'express';
import session from 'express-session';
import path from 'path';
import {
  authenticate, checkAuthenticated, checkUnauthenticated, init, logout
} from 'jazzy-authenticate';

import './models';

const port = process.env.PORT || 3020;

// Make express app
const app = express();

// Use ejs to render pages for demonstrative purposes
app.set('views', path.resolve(__dirname, '../ejs'));
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
app.get('/', checkAuthenticated(), (req, res) => res.render('home', { user: req.user }));

// render login page if not logged in
app.get('/login', checkUnauthenticated(), (req, res) => res.render('login', { error: null }));

// render register page if not logged in
app.get('/register', checkUnauthenticated(), (req, res) => res.render('register', { error: null }));

// logout if not logged in
app.get('/logout', checkAuthenticated(), logout());

// if logged out authenticate the user and login
app.post('/login', checkUnauthenticated(), authenticate());

// if logged out register user and login
app.post('/register', checkUnauthenticated(), authenticate('password_register'));

// Use overrides when you want different fail and success responses for example this endpoint
// sends a json response
app.get('/api/getDate', checkAuthenticated({
  onFail: { json: { error: 'You must be logged in to get the date' } }
}), (req, res) => {
  res.json({ date: new Date() });
});

// listen for requests
app.listen(port, () => {
  console.log(`Server successfully started on port ${port}`);
}).on('error', (error) => {
  console.log('Error on server startup');
  throw error;
});
