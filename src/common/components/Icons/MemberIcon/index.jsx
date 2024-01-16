import React from 'react';
import PropTypes from 'prop-types';

export const MemberIcon = ({ className, crownStartColor, crownEndColor, backgroundStartColor, backgroundEndColor }) => (
  <i className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path
        d="M32 61.7464C48.4285 61.7464 61.7464 48.4285 61.7464 32C61.7464 15.5716 48.4285 2.25366 32 2.25366C15.5715 2.25366 2.25363 15.5716 2.25363 32C2.25363 48.4285 15.5715 61.7464 32 61.7464Z"
        fill="url(#paint0_linear_3397_27287)"
      />
      <path
        d="M18.4699 43.8388H45.5301L48.9126 26.9262L38.765 30.3087L32 20.1611L25.235 30.3087L15.0874 27.2154L18.4699 43.8388Z"
        fill="url(#paint1_linear_3397_27287)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3397_27287"
          x1="32"
          y1="2.69277"
          x2="32"
          y2="61.024"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={backgroundStartColor} />
          <stop offset="1" stopColor={backgroundEndColor} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3397_27287"
          x1="16"
          y1="19.9999"
          x2="48"
          y2="43.9999"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={crownStartColor} />
          <stop offset="1" stopColor={crownEndColor} />
        </linearGradient>
      </defs>
    </svg>
  </i>
);

MemberIcon.propTypes = {
  className: PropTypes.string,
  crownStartColor: PropTypes.string,
  crownEndColor: PropTypes.string,
  backgroundStartColor: PropTypes.string,
  backgroundEndColor: PropTypes.string,
};
MemberIcon.defaultProps = {
  className: null,
  crownStartColor: '#91F7E7',
  crownEndColor: '#52A1FF',
  backgroundStartColor: '#DCFCFF',
  backgroundEndColor: '#D2DEFF',
};

MemberIcon.displayName = 'MemberIcon';
