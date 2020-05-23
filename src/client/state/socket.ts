import io from 'socket.io-client';

import { MessageType } from '../../shared/types/socket';
import { GameStatus, TeamStatus } from '../../shared/types/status';
import { Action, ActionTypes } from './context';

let socketConnection: SocketIOClient.Socket;

export function openSocketConnection(dispatch: React.Dispatch<Action>): void {
  if (socketConnection) {
    return;
  }

  socketConnection = io.connect();

  socketConnection.on('message', data => {
    const message = JSON.parse(data);

    switch (message.messageType) {
      case MessageType.TeamDeleted:
        dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: TeamStatus.Deleted });
        break;

      case MessageType.TeamAccepted:
        dispatch({ type: ActionTypes.SetTeamStatus, teamStatus: TeamStatus.Success });
        break;

      case MessageType.ChooseCategories:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.ChooseCategory });
        break;

      case MessageType.ChooseQuestion:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.ChooseQuestion });
        break;

      case MessageType.AskingQuestion:
        dispatch({
          type: ActionTypes.SetQuestion,
          question: {
            question: message.question,
            questionId: message.questionId,
            image: message.image,
            category: message.category
          }
        });
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.AskingQuestion });
        break;

      case MessageType.QuestionClosed:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.QuestionClosed });
        break;

      case MessageType.EndRound:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.RoundEnded });
        break;

      case MessageType.EndGame:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.EndGame });
        break;

      case MessageType.QuizMasterLeftGame:
        dispatch({ type: ActionTypes.SetGameStatus, gameStatus: GameStatus.QuizMasterLeft });
        break;
    }
  });
}
