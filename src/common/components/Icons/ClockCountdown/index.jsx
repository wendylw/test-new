import React from 'react';
import PropTypes from 'prop-types';

export const ClockCountdown = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={fill} viewBox="0 0 256 256">
    {/* eslint-disable-next-line  react/self-closing-comp */}
    <path d="M208,96a12,12,0,1,1,12,12A12,12,0,0,1,208,96ZM196,72a12,12,0,1,0-12-12A12,12,0,0,0,196,72Zm28.66,56a8,8,0,0,0-8.63,7.31A88.12,88.12,0,1,1,120.66,40,8,8,0,0,0,119.34,24,104.12,104.12,0,1,0,232,136.66,8,8,0,0,0,224.66,128ZM128,56a72,72,0,1,1-72,72A72.08,72.08,0,0,1,128,56Zm-8,72a8,8,0,0,0,8,8h48a8,8,0,0,0,0-16H136V80a8,8,0,0,0-16,0Zm40-80a12,12,0,1,0-12-12A12,12,0,0,0,160,48Z"></path>
  </svg>
);

ClockCountdown.propTypes = {
  fill: PropTypes.string,
};
ClockCountdown.defaultProps = {
  fill: '#000000',
};

ClockCountdown.displayName = 'ClockCountdown';