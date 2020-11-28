import React, { useState } from 'react';
import { Paper, TableContainer, Table, TableBody, TableRow, TableCell, TableHead, Breadcrumbs, Link, makeStyles } from '@material-ui/core';

import { useStateContext } from '../../../../state/context';

interface RoundData {
  id: string;
  name: string;
  questions: {
    id: string;
    text: string;
  }[];
}

interface Props {
  gameId: string;
  randomPrizePosition: number;
  rounds: RoundData[];
}

interface BreadcrumbProps {
  label: string;
  id: string;
}

const useStyles = makeStyles({
  breadcrumbs: {
    justifyContent: 'center'
  },
  breadcrumb: {
    cursor: 'pointer'
  },
  randomRow: {
    background: 'pink'
  }
});

const Leaderboard: React.FC<Props> = ({ gameId, randomPrizePosition, rounds }) => {
  const [activeRound, setActiveRound] = useState('');

  const {
    state: { scores, teams }
  } = useStateContext();

  const classes = useStyles();

  const scoresInGame = scores.find(s => s.gameId === gameId);

  const getTeamName = (teamId: string) => teams.find(t => t.teamId === teamId)?.teamName;

  const Breadcrumb = ({ id, label }: BreadcrumbProps) => (
    <Link color={activeRound === id ? 'textPrimary' : 'inherit'} onClick={() => setActiveRound(id)} className={classes.breadcrumb}>
      {label}
    </Link>
  );

  const scoresList = activeRound ? scoresInGame.rounds.find(r => r.id === activeRound)?.scores : scoresInGame?.leaderboard;

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" classes={{ ol: classes.breadcrumbs }}>
        <Breadcrumb id="" label="Full" />
        {rounds.map(r => (
          <Breadcrumb key={r.id} id={r.id} label={r.name} />
        ))}
      </Breadcrumbs>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pos</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Bonus</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoresList?.map(s => (
              <TableRow key={s.playerCode} className={activeRound === '' && s.position === randomPrizePosition ? classes.randomRow : undefined}>
                <TableCell>{s.position}</TableCell>
                <TableCell>
                  {getTeamName(s.teamId)} [{s.playerCode}]
                </TableCell>
                <TableCell>{s.score}</TableCell>
                <TableCell>{s.bonus}</TableCell>
                <TableCell>{s.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Leaderboard;
