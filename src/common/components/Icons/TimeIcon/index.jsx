import React from 'react';
import PropTypes from 'prop-types';

export const TimeIcon = ({ className }) => (
  <i className={className}>
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g fillRule="nonzero" fill="none">
        <path
          d="M0 12.002c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12s-12 5.372-12 12z"
          fill="#F2F2F3"
        />
        <path
          d="M5 12.002c0 3.866 3.212 7 7.175 7 3.963 0 7.175-3.134 7.175-7s-3.212-7-7.175-7c-3.963 0-7.175 3.134-7.175 7z"
          fill="#303030"
        />
        <path
          d="M6.794 12.002c0 2.9 2.409 5.25 5.381 5.25 2.972 0 5.381-2.35 5.381-5.25s-2.409-5.25-5.381-5.25c-2.972 0-5.381 2.35-5.381 5.25z"
          fill="#FFF"
        />
        <path fill="#FF9419" d="M11.577 7.918h1.196v4.084h-1.196z" />
        <path fill="#FF9419" d="m14.876 13.81-.803.784-2.282-2.227.803-.784z" />
        <path
          d="M11.278 12.002c0 .483.402.875.897.875a.886.886 0 0 0 .897-.875.886.886 0 0 0-.897-.875.886.886 0 0 0-.897.875z"
          fill="#FF9419"
        />
      </g>
    </svg>
  </i>
);

TimeIcon.propTypes = {
  className: PropTypes.string,
};
TimeIcon.defaultProps = {
  className: null,
};

TimeIcon.displayName = 'TimeIcon';
