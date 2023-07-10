import React, { Component } from 'react';
import GetPermission from './components/GetPermission';
import '../styles.scss';

class Permission extends Component {
  render() {
    return (
      <div data-test-id="qrscan.permission.container">
        <GetPermission />
      </div>
    );
  }
}
Permission.displayName = 'Permission';

export default Permission;
