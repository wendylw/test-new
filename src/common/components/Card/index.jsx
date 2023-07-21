import React from 'react';
import propTypes from 'prop-types';
import styles from './Card.module.scss';

const getClassName = classList => classList.filter(className => !!className).join(' ');

const Card = props => {
  const { children, className, contentClassName, active, disabled, onClick } = props;
  const containerClassName = getClassName([
    active ? styles.cardActive : styles.card,
    className,
    disabled ? styles.cardDisabled : '',
  ]);
  const contentClassNameFinal = getClassName(['tw-px-2 sm:tw-px-2px', contentClassName]);

  return (
    <div
      role="button"
      tabIndex="0"
      className={containerClassName}
      data-test-id="common.card.btn"
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      <div className={contentClassNameFinal}>{children}</div>
    </div>
  );
};

Card.displayName = 'Card';
Card.propTypes = {
  children: propTypes.node,
  className: propTypes.string,
  contentClassName: propTypes.string,
  active: propTypes.bool,
  disabled: propTypes.bool,
  onClick: propTypes.func,
};
Card.defaultProps = {
  children: null,
  className: '',
  contentClassName: '',
  active: false,
  disabled: false,
  onClick: () => {},
};

export default Card;
