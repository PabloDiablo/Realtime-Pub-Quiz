import React from 'react';

interface Props {
  subTitle?: string;
}

export class HeaderTitel extends React.Component<Props> {
  render() {
    return (
      <div className="mx-auto text-center text-white pt-5">
        <h1 className="display-3">Quarantine Quiz</h1>
        <p className="lead mb-0">{this.props.subTitle}</p>
      </div>
    );
  }
}

export default HeaderTitel;
