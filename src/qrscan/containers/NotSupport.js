import React, { Component } from 'react';
import Sorry from './components/Sorry';
import '../styles.scss';

class NotSupport extends Component {
  render() {
    return (
      <div data-test-id="qrscan.not-support.container">
        <Sorry />
      </div>
    );
  }
}
NotSupport.displayName = 'QRScanNotSupport';

export default NotSupport;
