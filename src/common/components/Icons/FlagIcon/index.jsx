import React from 'react';
import PropTypes from 'prop-types';

export const FlagIcon = ({ className }) => (
  <i className={className}>
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#FFF5EA" cx="12" cy="12" r="12" />
        <path d="M4 4h16v16H4z" />
        <path
          d="M15.5 6h-7a1 1 0 0 0-1 1v11a.506.506 0 0 0 .256.438.495.495 0 0 0 .506-.012L12 16.087l3.731 2.337a.519.519 0 0 0 .513.012A.506.506 0 0 0 16.5 18V7a1 1 0 0 0-1-1z"
          fill="#FF9419"
          fillRule="nonzero"
        />
      </g>
    </svg>
  </i>
);

FlagIcon.propTypes = {
  className: PropTypes.string,
};
FlagIcon.defaultProps = {
  className: '',
};

FlagIcon.displayName = 'FlagIcon';
