import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';

interface Props {
  openedAt: number;
  timeToAnswer: number;
}

interface StyleProps {
  pct: number;
  timeRemaining: number;
}

const useStyles = makeStyles({
  countdownBar: (props: StyleProps) => ({
    height: '25px',
    width: `${props.pct}%`,
    transition: `width ${props.timeRemaining}s linear`,
    backgroundColor: '#5b507a'
  })
});

const CountdownBar: React.FC<Props> = ({ openedAt, timeToAnswer }) => {
  const [pct, setPct] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<number>();

  const classes = useStyles({ pct, timeRemaining });

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      const now = Date.now();
      const endTime = openedAt + timeToAnswer;
      const remainingTime = endTime - now;

      const timeRemainingSeconds = Math.ceil(remainingTime) / 1000;

      setTimeRemaining(timeRemainingSeconds);
      setPct(0);
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [openedAt, timeToAnswer]);

  return <div className={classes.countdownBar} />;
};

export default CountdownBar;
