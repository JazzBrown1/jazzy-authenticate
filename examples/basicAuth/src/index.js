import express from 'express';
import { authenticate } from 'jazzy-authenticate';

// Import authentication model
import './basic-auth.model';

// Make express app
const app = express();

// Authenticate the request - selfInit is set to true in the model so init() is omitted
app.use(authenticate());

// some endpoint
app.get('/get-some-info', (req, res) => res.json({ result: req.user.someInfo }));

// some endpoint
app.get('/get-other-info', (req, res) => res.json({ result: req.user.otherInfo }));

// send error for unknown requests
app.use('*', (req, res) => res.json({ error: 'unknown request' }));

// listen for requests on port 3001 always use https in production
app.listen(3001);
