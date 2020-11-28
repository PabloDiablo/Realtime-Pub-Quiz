import express from 'express';
import 'firebase-functions';
import firebaseAdmin from 'firebase-admin';
import cookieParser from 'cookie-parser';
import { initialize } from 'fireorm';
import * as functions from 'firebase-functions';

import controllers from './controllers';

firebaseAdmin.initializeApp({
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

export const app = functions.https.onRequest(expressApp);
