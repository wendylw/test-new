import React, { Component } from 'react';
import "./style.scss";

class ErrorToast extends Component {
  render() {
    const { message } = this.props;
    return (
      <div className="error-toast">
        <div className="error-toast__text">
          {message}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.props.clearError();
    }, 3000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

export default ErrorToast;
