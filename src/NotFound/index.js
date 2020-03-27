import React from 'react';

// beep not found should always back to ordering store list page
class NotFound extends React.Component {
  componentDidMount() {
    window.location.href = '/';
  }

  render() {
    return null;
  }
}

export default NotFound;
