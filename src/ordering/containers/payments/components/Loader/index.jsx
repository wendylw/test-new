import React from 'react';
import PropTypes from 'prop-types';
import './PaymentLoader.scss';

const Loader = ({ loaded, className }) => {
  if (loaded) {
    return null;
  }

  return (
    <div className={`${className ? `${className}` : ''}`}>
      <div className="payment-loader loader-wave">
        <i className="dot dot1" />
        <i className="dot dot2" />
        <i className="dot dot3" />
        <i className="dot dot4" />
      </div>
    </div>
  );
};

Loader.displayName = 'PaymentLoader';

Loader.propTypes = {
  className: PropTypes.string,
  loaded: PropTypes.bool,
};

Loader.defaultProps = {
  className: '',
  loaded: false,
};

export default Loader;
