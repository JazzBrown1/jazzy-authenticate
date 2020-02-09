import { defineModel } from 'jazzy-authenticate';
import { findClientById } from './db';

defineModel('basic_auth', {
  useSessions: false,
  selfInit: true,
  getUser: (query, done) => findClientById(query.id, done),
  clientType: 'client',
  verify: (query, client, done) => {
    const result = query.secret === client.secret;
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
