import express from 'express';
import firebaseAdmin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import { initialize } from 'fireorm';

import controllers from './controllers';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
  storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`,
  projectId: process.env.GCLOUD_PROJECT
});

const firestore = firebaseAdmin.firestore();
initialize(firestore);

const expressApp = express();

expressApp.use(cookieParser());

// Set up controllers
expressApp.use('/api', controllers);

const port = process.env.PORT || 5001;
expressApp.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`API listening at http://localhost:${port}`);
  }
});
