import http from 'http';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import socketIo from 'socket.io';
import sharedSession from 'express-socket.io-session';
import connectMongo from 'connect-mongo';

import dbConfig from './config';
import controllers from './controllers';
import { onSocketConnection } from './socket/socket-handler';

const app = express();

const MongoStore = connectMongo(session);

// needed to make all requests from client work with this server.
app.use(cors({ origin: true, credentials: true }));
app.options(
  '*',
  cors({
    origin: true,
    credentials: true
  })
);

function start(mng: mongoose.Connection) {
  // WebSocket server, to give socket-handlers access to the session.
  const sessionParser = session({
    saveUninitialized: true,
    secret: 'DFJadslkfjgkf$%dfgjlsdg',
    resave: true,
    store: new MongoStore({ mongooseConnection: mng })
  });

  app.use(sessionParser);

  const server = http.createServer(app);
  const io = socketIo(server);

  // Set up controllers
  app.use('/api', controllers);

  io.use(sharedSession(sessionParser, { autoSave: true }));

  io.on('connection', onSocketConnection);

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
