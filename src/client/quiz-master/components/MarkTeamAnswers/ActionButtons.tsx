import React, { useState } from 'react';
import { faCheck, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { postMarkAnswer } from '../../services/quiz-master';
import { TeamSubmittedAnswer } from '../../../../shared/types/quizMaster';

interface Props {
  answer: TeamSubmittedAnswer;
  questionId: string;
  setTeamAnswers(answers: TeamSubmittedAnswer[]): void;
}

const ActionButtons: React.FC<Props> = ({ answer, questionId, setTeamAnswers }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);

  // isCorrect can be undefined
  const isMarked = answer.correct === true || answer.correct === false;

  if (isSaving) {
    return <div className="result__marked--neutral">Saving...</div>;
  }

  if (!hasUndo && isMarked) {
    const labelCssClass = answer.correct ? 'result__marked--correct' : 'result__marked--wrong';
    const label = answer.correct ? 'Correct' : 'Wrong';

    return (
      <>
        <div className={labelCssClass}>{label}</div>
        <button
          className="action-info"
          type="submit"
          onClick={() => {
            setHasUndo(true);
          }}
        >
          <FontAwesomeIcon icon={faUndo} aria-hidden="true" />
        </button>
      </>
    );
  }

  const markAnswer = async (isCorrect: boolean) => {
    setIsSaving(true);
    const res = await postMarkAnswer(answer.team._id, questionId, isCorrect);

    if (res.success) {
      setTeamAnswers(res.answers);
    }

    setIsSaving(false);
    setHasUndo(false);
  };

  return (
    <>
      <button className="action-success" type="submit" onClick={() => markAnswer(true)}>
        <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
      </button>
      <button className="action-danger" type="submit" onClick={() => markAnswer(false)}>
        <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
      </button>
    </>
  );
};

export default ActionButtons;
