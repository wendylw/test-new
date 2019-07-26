import React, { Component } from 'react';
import Sorry from './components/Sorry';

class NotSupport extends Component {
  render() {
    return (
      <div>
        <div className="img-content">
          <Sorry />
        </div>
      </div>
    );
  }
}

export default NotSupport;
