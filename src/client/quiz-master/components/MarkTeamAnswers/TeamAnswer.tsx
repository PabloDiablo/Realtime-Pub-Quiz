import React from 'react';

import ActionButtons from './ActionButtons';
import { TeamSubmittedAnswer } from '../../../../shared/types/quizMaster';

interface Props {
  answer: TeamSubmittedAnswer;
  isFirstCorrectAnswer: boolean;
  currentGameStatus: string;
  questionId: string;
  setTeamAnswers(answers: TeamSubmittedAnswer[]): void;
}

const TeamAnswer: React.FC<Props> = ({ answer, isFirstCorrectAnswer, currentGameStatus, questionId, setTeamAnswers }) => {
  const isQuestionClosed = currentGameStatus === 'question_closed';

  return (
    <div className="team-answer">
      <div className="name-actions-container">
        <div className="name-actions-container__name">
          {isFirstCorrectAnswer && '⭐'} {answer.team.name}
        </div>
        <div className="name-actions-container__actions">
          {isQuestionClosed && answer.gegeven_antwoord && <ActionButtons answer={answer} questionId={questionId} setTeamAnswers={setTeamAnswers} />}
        </div>
      </div>
      <div className="answer">{answer.gegeven_antwoord ?? 'No answer given yet'}</div>
    </div>
  );
};

export default TeamAnswer;
