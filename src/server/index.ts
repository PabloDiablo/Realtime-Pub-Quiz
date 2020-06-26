import mongoose from 'mongoose';
import express from 'express';
import firebaseAdmin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import { initialize } from 'fireorm';

import dbConfig from './config';
import controllers from './controllers';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: process.env.FB_DATABASE_URL
});

const firestore = firebaseAdmin.firestore();
initialize(firestore);

const app = express();

function start() {
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
}

mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(mng => {
    mng.connection.on('connected', () => {
      console.log('Database connected.');
    });

    mng.connection.on('disconnected', () => {
      console.log('Database disconnected.');
    });

    start();
  })
  .catch(err => {
    console.error('Database error!', err);
  });
