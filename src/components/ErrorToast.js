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
    const { className, message } = this.props;

    return (
      <div className={`top-message error fixed padding-normal ${className ? ` ${className}` : ''}`}>
        <div className="text-line-height-base">{message}</div>
      </div>
    );
  }
}

ErrorToast.propTypes = {
  className: PropTypes.string,
  clearError: PropTypes.func,
};

ErrorToast.defaultProps = {
  clearError: () => {},
};

export default ErrorToast;
