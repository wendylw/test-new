import React, { Component } from 'react';
import Scanner from './components/Scanner';
import '../styles.scss';

class Scan extends Component {
  render() {
    return (
      <div data-test-id="qrscan.scan.container">
        <Scanner />
      </div>
    );
  }
}
Scan.displayName = 'Scan';

export default Scan;
