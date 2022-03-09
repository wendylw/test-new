import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, MinusCircle } from 'phosphor-react';
import styles from './QuantityAdjuster.module.scss';

const QuantityAdjuster = props => {
  const {
    value,
    onChange = () => {},
    increaseDisabled = false,
    decreaseDisabled = false,
    className = '',
    size = 'normal',
    style = {},
  } = props;
  const handleIconClick = useCallback(
    delta => {
      if ((delta === -1 && !decreaseDisabled) || (delta === 1 && !increaseDisabled)) {
        onChange(delta);
      }
    },
    [onChange, decreaseDisabled, increaseDisabled]
  );
  return (
    <div className={`${styles.quantityAdjuster} ${className} ${styles[size]}`} style={style}>
      <MinusCircle
        className={`${styles.icon} ${decreaseDisabled ? styles.disabled : ''}`}
        weight="thin"
        onClick={() => handleIconClick(-1)}
      />
      <span className={`${styles.number} ${decreaseDisabled && increaseDisabled ? styles.disabled : ''}`}>{value}</span>
      <PlusCircle
        className={`${styles.icon} ${increaseDisabled ? styles.disabled : ''}`}
        weight="thin"
        onClick={() => handleIconClick(1)}
      />
    </div>
  );
};

QuantityAdjuster.displayName = 'QuantityAdjuster';
QuantityAdjuster.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  increaseDisabled: PropTypes.bool,
  decreaseDisabled: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['normal', 'large']),
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

QuantityAdjuster.defaultProps = {
  onChange: () => {},
  increaseDisabled: false,
  decreaseDisabled: false,
  className: '',
  size: 'normal',
  style: {},
};

QuantityAdjuster.defaultProps = {};

export default QuantityAdjuster;
