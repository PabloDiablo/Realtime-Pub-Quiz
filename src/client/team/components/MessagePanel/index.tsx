import React from 'react';

import MessageBox from '../../../shared/components/MessageBox';
import TeamInfo from '../TeamInfo';

interface Props {
  heading: React.ReactNode;
}

const MessagePanel: React.FC<Props> = ({ heading, children }) => (
  <>
    <TeamInfo />
    <MessageBox heading={heading}>{children}</MessageBox>
  </>
);

export default MessagePanel;
