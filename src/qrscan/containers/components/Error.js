import React, { Component } from 'react';

class Error extends Component {
  timer = null;

  render() {
    const { message } = this.props;
    return (
      <div>
        {message}
      </div>
    );
  }

  componentDidMount = () => {
    this.timer = setTimeout(() => {
      this.props.clearError();
    }, 3000);
  }

  componentWillUnmount = () => {
    if(this.timer) {
      clearTimeout(this.timer)
    }
  }
}

export default Error;