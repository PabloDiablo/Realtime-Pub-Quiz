import http from 'http';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import cors from 'cors';
import ws from 'ws';
import dbConfig from './config';
import { IncomingSocketMessage } from './types/socket';
import routes from './routes/api-routes';

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

// Require all RESTFULL API Routes
app.use('/api', routes);

httpServer.on('upgrade', (req, networkSocket, head) => {
  const res = {} as any; // eww
  sessionParser(req, res, () => {
    websocketServer.handleUpgrade(req, networkSocket, head, newWebSocket => {
      websocketServer.emit('connection', newWebSocket, req);
    });
  });
});

var players = {};
websocketServer.on('connection', (socket, req: IncomingSocketMessage) => {
  const socketId = req.session.sessionId;
  const gameRoom = req.session.gameRoomName;
  const quizMaster = req.session.quizMaster;
  const scoreBoard = req.session.scoreBoard;
  const teamName = req.session.teamName;

  console.log(`Socket connected: ${teamName} (${socketId})`);

  //Als er een session is met een gameRoomName zet je de gameRoomName in de socket
  if (gameRoom) {
    players[socketId] = socket;
    players[socketId].gameRoomName = gameRoom;
    players[socketId].teamName = teamName;

    //als diegene de quizmaster is, krijgt hij dat ook in zijn socket
    if (quizMaster) {
      players[socketId].quizMaster = true;
    }

    //als diegene de scoreboard is, krijgt hij dat ook in zijn socket
    if (scoreBoard) {
      players[socketId].scoreBoard = true;
    }
  }

  socket.on('message', (message: string) => {
    req.session.reload(err => {
      //convert json message to a javascript object
      const data = JSON.parse(message);

      if (err) throw err;

      /*====================================
            | TO: QuizMaster & ScoreBoard
            | Send NEW TEAM msg
            */
      if (data.messageType === 'NEW TEAM') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if ((players[key].quizMaster && players[key].gameRoomName === gameRoom) || (players[key].scoreBoard && players[key].gameRoomName === gameRoom)) {
              players[key].send(
                JSON.stringify({
                  messageType: 'NEW TEAM'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: Specific Team
            | Send TEAM ACCEPTED msg
            */
      if (data.messageType === 'TEAM ACCEPTED') {
        let data = JSON.parse(message);
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (!players[key].quizMaster && players[key].gameRoomName === gameRoom && players[key].teamName === data.teamName) {
              players[key].send(
                JSON.stringify({
                  messageType: 'TEAM ACCEPTED'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: Specific Team & ScoreBoard
            | Send TEAM DELETED msg
            */
      if (data.messageType === 'TEAM DELETED') {
        let data = JSON.parse(message);
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (
              (!players[key].quizMaster && players[key].gameRoomName === gameRoom && players[key].teamName === data.teamName) ||
              (players[key].scoreBoard && players[key].gameRoomName === gameRoom)
            ) {
              players[key].send(
                JSON.stringify({
                  messageType: 'TEAM DELETED'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom AND QuizMaster
            | Send message that the QuizMaster is choosing categories
            */
      if (data.messageType === 'CHOOSE CATEGORIES') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'CHOOSE CATEGORIES'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND scoreboard
            | Send message that the QuizMaster is choosing a question
            */
      if (data.messageType === 'CHOOSE QUESTION') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'CHOOSE QUESTION'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster is asking a question
            */
      if (data.messageType === 'ASKING QUESTION') {
        let data = JSON.parse(message);
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].gameRoomName === gameRoom || (players[key].scoreBoard && players[key].gameRoomName === gameRoom)) {
              players[key].send(
                JSON.stringify({
                  messageType: 'ASKING QUESTION',
                  question: data.question,
                  category: data.category,
                  maxQuestions: data.maxQuestions,
                  image: data.image
                })
              );
            }
          }
        }

        //For QuizMaster & ScoreBoard
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if ((players[key].quizMaster || players[key].scoreBoard) && players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'CORRECT QUESTION ANSWER',
                  answer: data.answer
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: QuizMaster
            | Send GET QUESTION ANSWERS msg
            */
      if (data.messageType === 'GET QUESTION ANSWERS') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].quizMaster && players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'GET QUESTION ANSWERS'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: ScoreBoard
            | Send SCOREBOARD TEAM ANSWERED msg
            */
      if (data.messageType === 'SCOREBOARD TEAM ANSWERED') {
        for (var key in players) {
          let data = JSON.parse(message);

          if (players.hasOwnProperty(key)) {
            if (players[key].scoreBoard && players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'SCOREBOARD TEAM ANSWERED',
                  teamName: data.teamName,
                  scoreBoardData: [
                    {
                      teamName: data.teamName
                    }
                  ]
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: ScoreBoard
            | Send SCOREBOARD TEAM ANSWERED msg
            */
      if (data.messageType === 'SEND ANSWERS TO SCOREBOARD') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].scoreBoard && players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'SEND ANSWERS TO SCOREBOARD'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has closed the current question
            */
      if (data.messageType === 'QUESTION CLOSED') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].gameRoomName === gameRoom || (players[key].scoreBoard && players[key].gameRoomName === gameRoom)) {
              players[key].send(
                JSON.stringify({
                  messageType: 'QUESTION CLOSED'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has closed the current question
            */
      if (data.messageType === 'END ROUND') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if (players[key].gameRoomName === gameRoom || (players[key].scoreBoard && players[key].gameRoomName === gameRoom)) {
              players[key].send(
                JSON.stringify({
                  messageType: 'END ROUND'
                })
              );
            }
          }
        }
      }

      /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has ended the game
            */
      if (data.messageType === 'END GAME') {
        for (var key in players) {
          if (players.hasOwnProperty(key)) {
            if ((players[key].gameRoomName === gameRoom || players[key].scoreBoard) && players[key].gameRoomName === gameRoom) {
              players[key].send(
                JSON.stringify({
                  messageType: 'END GAME'
                })
              );
            }
          }
        }
      }
      req.session.save(err => {
        if (err) {
          console.log('Could not save session.');
        }
      });
    });
  });

  socket.on('close', function close() {
    if (quizMaster) {
      for (var key in players) {
        if (players.hasOwnProperty(key)) {
          if (!players[key].scoreBoard && players[key].gameRoomName === gameRoom) {
            players[key].send(
              JSON.stringify({
                messageType: 'QUIZ MASTER LEFT GAME'
              })
            );
          }
        }
      }
    }

    console.log(`Socket disconnected: ${teamName}`);
  });
});

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
