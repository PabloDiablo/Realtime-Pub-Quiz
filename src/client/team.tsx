import React from 'react';

import { StateProvider } from './state/context';
import TeamApp from './components/team-app';

const Team: React.FC = () => (
  <StateProvider>
    <TeamApp />
  </StateProvider>
);

export default Team;
