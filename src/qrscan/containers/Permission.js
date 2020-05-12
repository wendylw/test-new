import React, { Component } from 'react';
import GetPermission from './components/GetPermission';
import '../styles.scss';

class Permission extends Component {
  render() {
    return (
      <div>
        <GetPermission />
      </div>
    );
  }
}

export default Permission;
