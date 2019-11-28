import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorToast extends Component {
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

  render() {
    const { message } = this.props;

    return (
      <div className="top-message error fixed">
        <div className="top-message__text">
          {message}
        </div>
      </div>
    );
  }
}

ErrorToast.propTypes = {
  clearError: PropTypes.func,
};

ErrorToast.defaultProps = {
  clearError: () => { },
};

export default ErrorToast;
