import express from 'express';
import firebaseAdmin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import { initialize } from 'fireorm';

import controllers from './controllers';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: process.env.FB_DATABASE_URL
});

const firestore = firebaseAdmin.firestore();
initialize(firestore);

const app = express();

app.use(cookieParser());

// Set up controllers
app.use('/api', controllers);

// Start the server.
const port = process.env.PORT || 3001;
app.listen(port, async () => {
  try {
    console.log(`Game server started on port http://localhost:${port}`);
  } catch (err) {
    console.log('Failed to start game server.');
    console.error(err);
  }
});
