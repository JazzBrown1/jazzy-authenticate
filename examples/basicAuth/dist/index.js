'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var jazzyAuthenticate = require('jazzy-authenticate');

const clients = {
  user: {
    id: 'user',
    secret: 'password',
    someInfo: 'Is the only client',
    otherInfo: 'Is not even real :('
  }
};

const findClientById = (id, cb) => {
  if (!clients[id]) return cb(null, null);
  cb(null, clients[id]);
};

console.log('hello' === 'hello');

jazzyAuthenticate.defineModel('basic_auth', {
  useSessions: false,
  selfInit: true,
  getUser: (query, done) => findClientById(query.id, done),
  clientType: 'client',
  verify: (query, client, done) => {
    const result = Boolean(query.secret === client.secret);
    done(null, result);
  },
  extract: (req, done) => {
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [id, secret] = Buffer.from(b64auth, 'base64').toString().split(':');
    done(null, { id, secret });
  },
  authenticateOnFail: { json: { error: 'unauthorized' } },
  authenticateOnError: { json: { error: 'internal server error' } }
}, true);

// Make express app
const app = express();

// Authenticate the request - selfInit is set to true in the model so init() is omitted
app.use(jazzyAuthenticate.authenticate());

// some endpoint
app.get('/get-some-info', (req, res) => res.json({ result: req.user.someInfo }));

// some endpoint
app.get('/get-other-info', (req, res) => res.json({ result: req.user.otherInfo }));

// send error for unknown requests
app.use('*', (req, res) => res.json({ error: 'unknown request' }));

// listen for requests on port 3001 always use https in production
app.listen(3001);
