import React from 'react';
import PropTypes from 'prop-types';

// Must be added an id to the svg to avoid the same id error, when the component is used multiple times
const MemberIcon = ({
  className,
  style,
  id,
  crownStartColor,
  crownEndColor,
  backgroundStartColor,
  backgroundEndColor,
  strokeColor,
}) => {
  const iconBackgroundId = `iconBackgroundId_${id}`;
  const iconCrownId = `iconCrownId_${id}`;

  return (
    <i className={className} style={style}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M29.8732 15.9999C29.8732 23.6618 23.662 29.8731 16 29.8731C8.33807 29.8731 2.12683 23.6618 2.12683 15.9999C2.12683 8.33795 8.33807 2.12671 16 2.12671C23.662 2.12671 29.8732 8.33795 29.8732 15.9999Z"
          fill={`url(#${iconBackgroundId})`}
          stroke={strokeColor}
          strokeWidth="2"
        />
        <path
          d="M9.23496 21.9194H22.765L24.4563 13.4631L19.3825 15.1543L16 10.0806L12.6175 15.1543L7.5437 13.6077L9.23496 21.9194Z"
          fill={`url(#${iconCrownId})`}
        />
        <defs>
          <linearGradient
            id={iconBackgroundId}
            x1="16"
            y1="1.34626"
            x2="16"
            y2="30.5119"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={backgroundStartColor} />
            <stop offset="1" stopColor={backgroundEndColor} />
          </linearGradient>
          <linearGradient id={iconCrownId} x1="8" y1="9.99997" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor={crownStartColor} />
            <stop offset="1" stopColor={crownEndColor} />
          </linearGradient>
        </defs>
      </svg>
    </i>
  );
};

MemberIcon.propTypes = {
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  id: PropTypes.string,
  crownStartColor: PropTypes.string,
  crownEndColor: PropTypes.string,
  backgroundStartColor: PropTypes.string,
  backgroundEndColor: PropTypes.string,
  strokeColor: PropTypes.string,
};
MemberIcon.defaultProps = {
  className: null,
  style: null,
  id: 'id',
  crownStartColor: '#91F7E7',
  crownEndColor: '#52A1FF',
  backgroundStartColor: '#DCFCFF',
  backgroundEndColor: '#D2DEFF',
  strokeColor: '#5CADFC',
};

MemberIcon.displayName = 'MemberIcon';

export default MemberIcon;
