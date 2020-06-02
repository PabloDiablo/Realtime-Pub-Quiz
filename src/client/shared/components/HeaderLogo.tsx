import React from 'react';

interface Props {
  subTitle?: string;
}

const HeaderLogo: React.FC<Props> = ({ subTitle }) => (
  <div className="mx-auto text-center text-white pt-5">
    <div className="header__logo">
      <img src="/images/logo.png" alt="Logo" />
    </div>
    <p className="lead mb-0">{subTitle}</p>
  </div>
);

export default HeaderLogo;
