import { Socket } from '../types/socket';

import { MessageType } from '../../shared/types/socket';

const players = new Map<string, Socket>();

export function onSocketConnection(socket: Socket) {
  const session = socket.handshake.session;
  const socketId = session.id;
  const gameRoom = session.gameRoomName;
  const quizMaster = session.quizMaster;
  const teamName = session.teamName;

  const getStatusMessage = () => {
    const getTeamName = () => (quizMaster ? 'Quiz Master' : `Team: ${teamName}`);
    return `${socketId} (${getTeamName()}). Players connected: ${players.size}`;
  };

  function sendMessageToAllPlayers(message: {}): void {
    for (const [, playerSocket] of players) {
      if (playerSocket.handshake.session.gameRoomName === gameRoom) {
        playerSocket.send(JSON.stringify(message));
      }
    }
  }

  function sendMessageToQuizMaster(message: {}): void {
    for (const [, playerSocket] of players) {
      const playerSession = playerSocket.handshake.session;
      if (playerSession.gameRoomName === gameRoom && playerSession.quizMaster) {
        playerSocket.send(JSON.stringify(message));
      }
    }
  }

  function sendMessageToTeam(message: {}, receivingTeamName: string): void {
    for (const [, playerSocket] of players) {
      const playerSession = playerSocket.handshake.session;
      if (playerSession.gameRoomName === gameRoom && playerSession.teamName === receivingTeamName) {
        playerSocket.send(JSON.stringify(message));
      }
    }
  }

  if (gameRoom) {
    players.set(socketId, socket);
  }

  console.log(`Socket connected: ${getStatusMessage()}`);

  socket.on('message', (message: string) => {
    //convert json message to a javascript object
    const data = JSON.parse(message);

    /*====================================
            | TO: QuizMaster & ScoreBoard
            | Send NEW TEAM msg
            */
    if (data.messageType === MessageType.NewTeam) {
      sendMessageToQuizMaster({
        messageType: 'NEW TEAM'
      });
    }

    /*====================================
            | TO: Specific Team
            | Send TEAM ACCEPTED msg
            */
    if (data.messageType === MessageType.TeamAccepted) {
      sendMessageToTeam(
        {
          messageType: 'TEAM ACCEPTED'
        },
        data.teamName
      );
    }

    /*====================================
            | TO: Specific Team & ScoreBoard
            | Send TEAM DELETED msg
            */
    if (data.messageType === MessageType.TeamDeleted) {
      sendMessageToTeam(
        {
          messageType: 'TEAM DELETED'
        },
        data.teamName
      );
    }

    /*====================================
            | TO: All teams in a gameRoom AND QuizMaster
            | Send message that the QuizMaster is choosing categories
            */
    if (data.messageType === MessageType.ChooseCategories) {
      sendMessageToAllPlayers({
        messageType: 'CHOOSE CATEGORIES'
      });
    }

    /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND scoreboard
            | Send message that the QuizMaster is choosing a question
            */
    if (data.messageType === MessageType.ChooseQuestion) {
      sendMessageToAllPlayers({
        messageType: 'CHOOSE QUESTION'
      });
    }

    /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster is asking a question
            */
    if (data.messageType === MessageType.AskingQuestion) {
      sendMessageToAllPlayers({
        messageType: 'ASKING QUESTION',
        question: data.question,
        category: data.category,
        maxQuestions: data.maxQuestions,
        image: data.image
      });

      //For QuizMaster & ScoreBoard
      sendMessageToQuizMaster({
        messageType: 'CORRECT QUESTION ANSWER',
        answer: data.answer
      });
    }

    /*====================================
            | TO: QuizMaster
            | Send GET QUESTION ANSWERS msg
            */
    if (data.messageType === MessageType.GetQuestionAnswers) {
      sendMessageToQuizMaster({
        messageType: 'GET QUESTION ANSWERS'
      });
    }

    /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has closed the current question
            */
    if (data.messageType === MessageType.QuestionClosed) {
      sendMessageToAllPlayers({
        messageType: 'QUESTION CLOSED'
      });
    }

    /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has closed the current question
            */
    if (data.messageType === MessageType.EndRound) {
      sendMessageToAllPlayers({
        messageType: 'END ROUND'
      });
    }

    /*====================================
            | TO: All teams in a gameRoom, QuizMaster AND ScoreBoard
            | Send message that the QuizMaster has ended the game
            */
    if (data.messageType === MessageType.EndGame) {
      sendMessageToAllPlayers({
        messageType: 'END GAME'
      });
    }

    session.save(err => {
      if (err) {
        console.log('Could not save session.');
      }
    });
  });

  socket.on('disconnect', function close() {
    if (quizMaster) {
      sendMessageToAllPlayers({
        messageType: 'QUIZ MASTER LEFT GAME'
      });
    }

    players.delete(socketId);

    console.log(`Socket disconnected: ${getStatusMessage()}`);
  });
}
