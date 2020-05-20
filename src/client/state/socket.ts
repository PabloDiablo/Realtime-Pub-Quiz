import io from 'socket.io-client';

import { MessageType } from '../../shared/types/socket';
import { GameStatus } from '../../shared/types/status';
import { TeamStatus, Question } from '../types/state';

let socketConnection: SocketIOClient.Socket;

interface Props {
  setGameStatus(state: GameStatus): void;
  setTeamStatus(state: TeamStatus): void;
  setQuestion(state: Question): void;
}

export function openSocketConnection({ setGameStatus, setTeamStatus, setQuestion }: Props): void {
  if (socketConnection) {
    return;
  }

  socketConnection = io.connect();

  socketConnection.on('message', data => {
    const message = JSON.parse(data);

    switch (message.messageType) {
      case MessageType.TeamDeleted:
        setTeamStatus(TeamStatus.Deleted);
        break;

      case MessageType.TeamAccepted:
        setTeamStatus(TeamStatus.Success);
        break;

      case MessageType.ChooseCategories:
        setGameStatus(GameStatus.ChooseCategory);
        break;

      case MessageType.ChooseQuestion:
        setGameStatus(GameStatus.ChooseQuestion);
        break;

      case MessageType.AskingQuestion:
        setGameStatus(GameStatus.AskingQuestion);
        setQuestion({
          question: message.question,
          questionId: message.questionId,
          image: message.image,
          category: message.category,
          maxQuestions: message.maxQuestions
        });
        break;

      case MessageType.QuestionClosed:
        setGameStatus(GameStatus.QuestionClosed);
        break;

      case MessageType.EndRound:
        setGameStatus(GameStatus.RoundEnded);
        break;

      case MessageType.EndGame:
        setGameStatus(GameStatus.EndGame);
        break;

      case MessageType.QuizMasterLeftGame:
        setGameStatus(GameStatus.QuizMasterLeft);
        break;
    }
  });
}
