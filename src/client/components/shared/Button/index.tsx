import React from 'react';

import './styles.css';

interface Props {
  onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  action: 'success' | 'danger' | 'info';
  disabled?: boolean;
}

const Button: React.FC<Props> = ({ onClick, action, disabled, children }) => (
  <button onClick={event => !disabled && onClick(event)} disabled={disabled} className={`shared-button action-${action}`}>
    {children}
  </button>
);

export default Button;
