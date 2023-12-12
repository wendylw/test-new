import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ className, message, clearError }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line react/destructuring-assignment
      clearError();
    }, 3000);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`error-toast error-toast__error padding-normal ${className ? ` ${className}` : ''}`}>
      <p className="text-line-height-base">{message}</p>
    </div>
  );
};

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
