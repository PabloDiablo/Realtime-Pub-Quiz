import React from 'react';

import { StateProvider } from './state/context';
import TeamApp from './components/team-app';

interface Props {
  forceNewGame?: boolean;
}

const Team: React.FC<Props> = props => (
  <StateProvider>
    <TeamApp {...props} />
  </StateProvider>
);

export default Team;
