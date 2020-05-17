import React from 'react';

import { GameRoomTeamWithAnswer } from '../../../types/state';
import ActionButtons from './ActionButtons';

interface Props {
  team: GameRoomTeamWithAnswer;
  isFirstCorrectAnswer: boolean;
  currentGameStatus: string;
  questionId: string;
}

const TeamAnswer: React.FC<Props> = ({ team, isFirstCorrectAnswer, currentGameStatus, questionId }) => {
  const isQuestionClosed = currentGameStatus === 'question_closed';

  return (
    <div className="team-answer">
      <div className="name-actions-container">
        <div className="name-actions-container__name">
          {isFirstCorrectAnswer && '⭐'} {team.name}
        </div>
        <div className="name-actions-container__actions">{isQuestionClosed && team.teamAnswer && <ActionButtons team={team} questionId={questionId} />}</div>
      </div>
      <div className="answer">{team.teamAnswer ?? 'No answer given yet'}</div>
    </div>
  );
};

export default TeamAnswer;
