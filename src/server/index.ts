import http from 'http';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import connectMongo from 'connect-mongo';
import firebaseAdmin from 'firebase-admin';
import cookieParser from 'cookie-parser';

import dbConfig from './config';
import controllers from './controllers';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: process.env.FB_DATABASE_URL
});

const app = express();

const MongoStore = connectMongo(session);

function start(mng: mongoose.Connection) {
  app.use(
    session({
      saveUninitialized: true,
      secret: 'DFJadslkfjgkf$%dfgjlsdg',
      resave: true,
      store: new MongoStore({ mongooseConnection: mng })
    }) as any
  );

  app.use(cookieParser());

  const server = http.createServer(app);

  // Set up controllers
  app.use('/api', controllers);

  // Start the server.
  const port = process.env.PORT || 3001;
  server.listen(port, async () => {
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

    start(mng.connection);
  })
  .catch(err => {
    console.error('Database error!', err);
  });
