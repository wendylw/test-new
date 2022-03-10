/**
 * Badge
 * There're two ways to use badge:
 * 1. Wrap another component in Badge component -- the badge will be displayed on the right top conner of the wrapped component.
 *    Example:
 *    <Badge value={4}>
 *      <Handbag size={32} />
 *    </Badge>
 * 2. Use Badge component with no child -- the badge is displayed inline.
 *    Example:
 *    <Badge value={4} />
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.scss';

const BadgeLabel = props => {
  const { children, className, style } = props;
  return (
    <span className={`${styles.badge} ${className}`} style={style}>
      {children}
    </span>
  );
};

BadgeLabel.displayName = 'BadgeLabel';
BadgeLabel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
BadgeLabel.defaultProps = {
  children: null,
  className: '',
  style: {},
};

const Badge = props => {
  const { children, value, className, style, offset = [0, 0] } = props;
  const [top, right] = offset;
  if (children) {
    const badgeLabelStyle = {
      position: 'absolute',
      top,
      right,
      transform: 'translate(50%,-50%)',
      transformOrigin: '100% 0%',
      ...style,
    };

    return (
      <span className={styles.badgeContainer}>
        {children}
        <BadgeLabel className={className} style={badgeLabelStyle}>
          {value}
        </BadgeLabel>
      </span>
    );
  }
  return (
    <BadgeLabel className={className} style={style}>
      {value}
    </BadgeLabel>
  );
};

Badge.displayName = 'Badge';
Badge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  offset: PropTypes.arrayOf(PropTypes.number),
};
Badge.defaultProps = {
  children: null,
  className: '',
  style: {},
  value: '',
  offset: [0, 0],
};

export default Badge;
