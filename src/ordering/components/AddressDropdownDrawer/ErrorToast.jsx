import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Toast extends Component {
  componentDidMount() {
    this.timer = setTimeout(() => {
      // eslint-disable-next-line react/destructuring-assignment
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
      <div className={`error-toast error-toast__error padding-normal ${className ? ` ${className}` : ''}`}>
        <div className="text-line-height-base">{message}</div>
      </div>
    );
  }
}

Toast.propTypes = {
  className: PropTypes.string,
  clearError: PropTypes.func,
  message: PropTypes.string,
};

Toast.defaultProps = {
  clearError: () => {},
  className: '',
  message: '',
};

Toast.displayName = 'Toast';

export default Toast;
