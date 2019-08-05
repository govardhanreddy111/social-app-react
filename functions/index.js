const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login } = require('./handlers/users');
const FBAuth  = require('./util/fbauth');

// Screams Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// Login Routes
app.post('/signup',signup);
app.post('/login', login);

exports.api = functions.region('asia-east2').https.onRequest(app);
