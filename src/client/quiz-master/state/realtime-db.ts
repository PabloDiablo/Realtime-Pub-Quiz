import firebase from 'firebase/app';

import { Action, ActionTypes } from './context';
import * as state from '../types/state';
import { TeamStatus } from '../../../shared/types/status';

interface FirebaseTeam {
  teamName: string;
  teamId: string;
  status: TeamStatus;
  gameRoom: string;
  playerCode: string;
}

interface TeamScore {
  teamId: string;
  playerCode: string;
  score: number;
  bonus: number;
}

interface RoundScore {
  name: string;
  id: string;
  scores: Record<string, TeamScore>;
}

interface ScoresData {
  leaderboard: Record<string, TeamScore>;
  rounds: Record<string, RoundScore>;
}

export function openRealtimeDbConnection(dispatch: React.Dispatch<Action>): void {
  const db = firebase.database();
  const gameDbRef = db.ref('games');
  const teamDbRef = db.ref('teams');
  const scoresDbRef = db.ref('scores');

  gameDbRef.on('value', snap => {
    dispatch({ type: ActionTypes.SetHasConnected });

    const val = snap.val();

    if (!val) {
      return;
    }

    const games: state.Game[] = val
      ? Object.entries(val as Record<string, state.Game>).map(([gameId, obj]) => ({
          id: gameId,
          name: gameId,
          status: obj.status,
          question: obj.question,
          round: obj.round
        }))
      : [];

    dispatch({ type: ActionTypes.SetGames, games });
  });

  teamDbRef.on('value', snap => {
    const val = snap.val();

    const teams: state.Team[] = [];

    if (val) {
      Object.values(val as Record<string, Record<string, FirebaseTeam>>).forEach(game => {
        Object.entries(game).forEach(([teamId, obj]) => {
          teams.push({
            teamId: teamId,
            teamName: obj.teamName,
            playerCode: obj.playerCode,
            status: obj.status,
            gameId: obj.gameRoom
          });
        });
      });
    }

    dispatch({ type: ActionTypes.SetTeams, teams });
  });

  scoresDbRef.on('value', snap => {
    const val = snap.val();

    if (!val) {
      return;
    }

    const sortByPoints = (a: state.TeamScore, b: state.TeamScore): number => {
      return b.total - a.total;
    };

    const toLeaderboard = (obj: Record<string, TeamScore>): state.TeamScore[] => {
      if (!obj) {
        return [];
      }

      const values = Object.values(obj)
        .map(v => ({ ...v, total: v.score + v.bonus, position: 0 }))
        .sort(sortByPoints);

      for (let i = 0; i < values.length; i++) {
        if (i === 0) {
          values[i].position = 1;
          continue;
        }

        if (values[i - 1].total === values[i].total) {
          values[i].position = values[i - 1].position;
        } else {
          values[i].position = values[i - 1].position + 1;
        }
      }

      return values;
    };

    const scores: state.ScoresList[] = val
      ? Object.entries(val as Record<string, ScoresData>).map(([gameId, obj]) => {
          return {
            gameId,
            leaderboard: toLeaderboard(obj.leaderboard),
            rounds: Object.values(obj.rounds).map(r => ({
              id: r.id,
              name: r.name,
              scores: toLeaderboard(r.scores)
            }))
          };
        })
      : [];

    dispatch({ type: ActionTypes.SetScores, scores });
  });
}
