import http from 'http';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import ws from 'ws';

import dbConfig from './config';
import controllers from './controllers';
import { onSocketConnection } from './socket/socket-handler';

const app = express();

// needed to make all requests from client work with this server.
app.use(cors({ origin: true, credentials: true }));
app.options(
  '*',
  cors({
    origin: true,
    credentials: true
  })
);

// WebSocket server, to give socket-handlers access to the session.
const sessionParser = session({
  saveUninitialized: true,
  secret: 'DFJadslkfjgkf$%dfgjlsdg',
  resave: true
});

app.use(sessionParser);

const httpServer = http.createServer(app);

const server = http.createServer({});

// Create the Web socket server.
const websocketServer = new ws.Server({ server });

// Set up controllers
app.use('/api', controllers);

httpServer.on('upgrade', (req, networkSocket, head) => {
  const res = {} as any; // eww
  sessionParser(req, res, () => {
    websocketServer.handleUpgrade(req, networkSocket, head, newWebSocket => {
      websocketServer.emit('connection', newWebSocket, req);
    });
  });
});

websocketServer.on('connection', onSocketConnection);

// Start the server.
const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  mongoose.connect(
    `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    () => {
      console.log(`Game server started on port http://localhost:${port}`);
    }
  );
});
