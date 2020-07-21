import React, { Component } from 'react';
import Sorry from './components/Sorry';
import '../styles.scss';

class NotSupport extends Component {
  render() {
    return (
      <div data-heap-name="qrscan.not-support.container">
        <Sorry />
      </div>
    );
  }
}

export default NotSupport;
