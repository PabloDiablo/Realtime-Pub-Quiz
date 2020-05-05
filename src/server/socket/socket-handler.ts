import { Socket } from '../types/socket';

import { MessageType } from '../../shared/types/socket';
import {
  getSessionById,
  getPlayerCountByGameRoom,
  addSocketToSession,
  removeSocketFromSession,
  closeGameroom,
  getAllSocketHandlesByGameRoom,
  getQuizMasterSocketHandleByGameRoom,
  getSocketHandleByTeamName
} from '../session';

export function onSocketConnection(socket: Socket) {
  const sessionId = socket.handshake.session.id;

  const session = getSessionById(sessionId);

  if (!session) {
    return;
  }

  const getStatusMessage = () => {
    const getTeamName = () => (session.isQuizMaster ? 'Quiz Master' : `Team: ${session.teamName}`);
    return `${sessionId} (${getTeamName()}). Players connected: ${getPlayerCountByGameRoom(session.gameRoom)}`;
  };

  function sendMessageToAllPlayers(message: {}): void {
    const sockets = getAllSocketHandlesByGameRoom(session.gameRoom);
    sockets.forEach(playerSocket => playerSocket && playerSocket.send(JSON.stringify(message)));
  }

  function sendMessageToQuizMaster(message: {}): void {
    const playerSocket = getQuizMasterSocketHandleByGameRoom(session.gameRoom);
    if (playerSocket) {
      playerSocket.send(JSON.stringify(message));
    }
  }

  function sendMessageToTeam(message: {}, receivingTeamName: string): void {
    const playerSocket = getSocketHandleByTeamName(receivingTeamName);
    if (playerSocket) {
      playerSocket.send(JSON.stringify(message));
    }
  }

  addSocketToSession(sessionId, socket);

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
  });

  socket.on('disconnect', function close() {
    if (session.isQuizMaster) {
      sendMessageToAllPlayers({
        messageType: 'QUIZ MASTER LEFT GAME'
      });

      closeGameroom(session.gameRoom);
    }

    removeSocketFromSession(sessionId);

    console.log(`Socket disconnected: ${getStatusMessage()}`);
  });
}
