import React from 'react';

import { GameRoomTeamWithAnswer } from '../../../types/state';
import ActionButtons from './ActionButtons';

interface Props {
  team: GameRoomTeamWithAnswer;
  isFirstCorrectAnswer: boolean;
  currentGameStatus: string;
  gameRoom: string;
  roundNumber: string;
  questionNumber: string;
}

const TeamAnswer: React.FC<Props> = ({ team, isFirstCorrectAnswer, currentGameStatus, gameRoom, roundNumber, questionNumber }) => {
  const isQuestionClosed = currentGameStatus === 'question_closed';

  return (
    <div className="team-answer">
      <div className="name-actions-container">
        <div className="name-actions-container__name">
          {isFirstCorrectAnswer && '⭐'} {team._id}
        </div>
        <div className="name-actions-container__actions">
          {isQuestionClosed && <ActionButtons team={team} gameRoom={gameRoom} roundNumber={roundNumber} questionNumber={questionNumber} />}
        </div>
      </div>
      <div className="answer">{team.teamAnswer ?? 'No answer given yet'}</div>
    </div>
  );
};

export default TeamAnswer;
