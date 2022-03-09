import React from 'react';
import { CircleNotch } from 'phosphor-react';
import PropTypes from 'prop-types';

const Loader = ({ className, ...restProps }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <CircleNotch className={`tw-animate-spin ${className}`} {...restProps} />
);

Loader.displayName = 'Loader';
Loader.propTypes = {
  className: PropTypes.string,
};
Loader.defaultProps = {
  className: '',
};

export default Loader;
