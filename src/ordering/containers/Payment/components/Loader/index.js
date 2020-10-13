import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './PaymentLoader.scss';

class Loader extends Component {
  render() {
    const { loaded, className } = this.props;

    if (loaded) {
      return null;
    }

    return (
      <div className={`${className ? `${className}` : ''}`}>
        <div className="payment-loader loader-wave">
          <i className="dot dot1"></i>
          <i className="dot dot2"></i>
          <i className="dot dot3"></i>
          <i className="dot dot4"></i>
        </div>
      </div>
    );
  }
}

Loader.propTypes = {
  className: PropTypes.string,
  loaded: PropTypes.bool,
};

Loader.defaultProps = {
  className: '',
  loaded: false,
};

export default Loader;
