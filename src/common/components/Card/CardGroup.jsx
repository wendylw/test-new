import React from 'react';
import propTypes from 'prop-types';

const DIRECTIONS = ['x', 'y'];
const SPACINGS = ['16'];
const GAP_CLASS_MAPPING = {
  x16: 'tw-gap-x-16 sm:tw-gap-x-16px',
  y16: 'tw-gap-y-16 sm:tw-gap-y-16px',
};

const getClassName = classList => classList.filter(className => !!className).join(' ');

const CardGroup = props => {
  const { children, className, direction, spacing } = props;
  const containerClassName = getClassName([
    'tw-flex',
    direction === 'y' ? 'tw-flex-col' : 'tw-flex-row',
    GAP_CLASS_MAPPING[`${direction}${spacing}`],
    className,
  ]);

  return <section className={containerClassName}>{children}</section>;
};

CardGroup.displayName = 'CardGroup';
CardGroup.propTypes = {
  children: propTypes.node,
  className: propTypes.string,
  // x is for horizontal, y is for vertical.
  direction: propTypes.oneOf(DIRECTIONS),
  // Spacing between each Card
  spacing: propTypes.oneOf(SPACINGS),
};
CardGroup.defaultProps = {
  children: null,
  className: '',
  direction: 'y',
  spacing: '0',
};

export default CardGroup;
