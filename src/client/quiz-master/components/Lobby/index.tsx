import React from 'react';
import { Button } from 'react-bootstrap';

import { startGame } from '../../services/websocket';
import HeaderLogo from '../../../shared/components/HeaderLogo';

import './styles.css';
import TeamActionButtons from './TeamActionButtons';
import { useStateContext } from '../../state/context';

const Lobby: React.FC = () => {
  const {
    state: { teams, gameRoom }
  } = useStateContext();

  const isGameReady = teams.some(team => team.accepted);

  return (
    <div className="container-fluid px-md-5">
      <div className="row py-5 text-white">
        <HeaderLogo subTitle="This is the quiz master panel" />
      </div>

      <div className="rounded">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="nav flex-column bg-white shadow-sm font-italic rounded p-3">
              <h3 className="text-center">Quiz info</h3>
              <hr />
              <p>
                <b>Gameroom name:</b> {gameRoom}
              </p>
              <Button
                variant="outline-success"
                type="submit"
                disabled={!isGameReady}
                onClick={() => {
                  startGame(gameRoom);
                }}
              >
                Start quiz
              </Button>
            </div>
          </div>

          <div className="col-lg-8 mb-5">
            <div className="lobby__list-container">
              <div className="lobby__list-label">Teams</div>
              <div className="lobby__list"></div>
              {teams.map(team => (
                <div key={team.teamId} className="lobby__list-item">
                  <div className="lobby__list-item-label">
                    {team.teamName} [{team.playerCode}]
                  </div>
                  <div className="lobby__list-item-buttons">
                    <TeamActionButtons team={team} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
