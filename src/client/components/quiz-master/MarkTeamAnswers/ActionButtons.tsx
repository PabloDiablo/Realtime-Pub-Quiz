import React, { useState } from 'react';
import { faCheck, faTimes, faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { teamAnswerIsCorrect } from '../../../websocket';
import { GameRoomTeamWithAnswer } from '../../../types/state';

interface Props {
  team: GameRoomTeamWithAnswer;
  gameRoom: string;
  roundNumber: string;
  questionNumber: string;
}

const ActionButtons: React.FC<Props> = ({ team, gameRoom, roundNumber, questionNumber }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);

  // isCorrect can be undefined
  const isMarked = team.isCorrect === true || team.isCorrect === false;

  if (isSaving) {
    return <div className="result__marked--neutral">Saving...</div>;
  }

  if (!hasUndo && isMarked) {
    const labelCssClass = team.isCorrect ? 'result__marked--correct' : 'result__marked--wrong';
    const label = team.isCorrect ? 'Correct' : 'Wrong';

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

  return (
    <>
      <button
        className="action-success"
        type="submit"
        onClick={async () => {
          setIsSaving(true);
          try {
            await teamAnswerIsCorrect(gameRoom, roundNumber, questionNumber, team._id, true);
          } finally {
            setIsSaving(false);
            setHasUndo(false);
          }
        }}
      >
        <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
      </button>
      <button
        className="action-danger"
        type="submit"
        onClick={async () => {
          setIsSaving(true);
          try {
            await teamAnswerIsCorrect(gameRoom, roundNumber, questionNumber, team._id, false);
          } finally {
            setIsSaving(false);
            setHasUndo(false);
          }
        }}
      >
        <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
      </button>
    </>
  );
};

export default ActionButtons;
