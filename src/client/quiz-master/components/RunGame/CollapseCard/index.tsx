import React, { useState } from 'react';
import { Collapse, Card, CardContent, Typography } from '@material-ui/core';

interface Props {
  title: string;
}

const CollapseCard: React.FC<Props> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <CardContent onClick={() => setIsExpanded(v => !v)}>
        <Typography variant="h6">{title}</Typography>
      </CardContent>
      <Collapse in={isExpanded}>{children}</Collapse>
    </Card>
  );
};

export default CollapseCard;
