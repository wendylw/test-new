import React from 'react';
import { withRouter } from 'react-router-dom';

class Error extends React.Component {
  render() {
    const { message = '' } = this.props.location.state || {};

    return (
      <div style={{ textAlign: 'center', width: '100%', color: 'red' }}>
        <h2 style={{ fontSize: '18px', marginTop: '0.6em' }}>{`Oops!`}</h2>
        <h3 style={{ fontSize: '16px', marginTop: '0.6em' }}>{message}</h3>
      </div>
    );
  }
}


export default withRouter(Error);
