import React, { Component } from 'react';
import Scanner from './components/Scanner';
import '../styles.scss';

class Scan extends Component {
  render() {
    return (
      <div data-heap-name="qrscan.scan.container">
        <Scanner />
      </div>
    );
  }
}
Scan.displayName = 'Scan';

export default Scan;
