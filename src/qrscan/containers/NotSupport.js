import React, { Component } from 'react';
import Sorry from './components/Sorry';
import '../styles.scss';

class NotSupport extends Component {
  render() {
    return (
      <div>
        <Sorry />
      </div>
    );
  }
}

export default NotSupport;
