import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ErrorToast.scss';

class ErrorToast extends Component {
  componentDidMount() {
    const { clearError } = this.props;

    this.timer = setTimeout(() => {
      clearError();
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
      <div className={`error-toast error-toast__error padding-normal ${className ? ` ${className}` : ''}`}>
        <div className="text-line-height-base">{message}</div>
      </div>
    );
  }
}

ErrorToast.propTypes = {
  className: PropTypes.string,
  clearError: PropTypes.func,
  message: PropTypes.string,
};

ErrorToast.defaultProps = {
  clearError: () => {},
  className: '',
  message: '',
};

ErrorToast.displayName = 'ErrorToast';

export default ErrorToast;
