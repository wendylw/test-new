import React, { useCallback } from 'react';
import propTypes from 'prop-types';
import Loader from '../Loader';
import styles from './Button.module.scss';

const Button = props => {
  const {
    children,
    className = '',
    style = {},
    type = 'primary',
    size,
    danger = false,
    icon = null,
    loading = false,
    onClick = () => {},
    ...rest
  } = props;
  const onButtonClick = useCallback(
    e => {
      if (!loading) {
        return onClick(e);
      }
      return undefined;
    },
    [onClick, loading]
  );
  return (
    <button
      onClick={onButtonClick}
      className={`${styles.button} type-${type}${danger ? '-danger' : ''}${size ? ` size-${size}` : ''} ${className}`}
      style={style}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {loading || icon ? (
        <span className={styles.iconWrapper}>
          {/* svg cannot has both svg animateTransform and css transform,
              so iconInnerWrapper is to add vertical offset via css transform,
              while make sure the icon is also able to have animateTransform */}
          <span className={styles.iconInnerWrapper}>
            {loading ? <Loader className="tw-text-xl" weight="bold" /> : icon}
          </span>
        </span>
      ) : null}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: propTypes.node,
  className: propTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: propTypes.object,
  icon: propTypes.element,
  loading: propTypes.bool,
  type: propTypes.oneOf(['primary', 'secondary', 'text']),
  size: propTypes.oneOf(['small']),
  danger: propTypes.bool,
  onClick: propTypes.func,
};

Button.defaultProps = {
  children: null,
  className: '',
  icon: null,
  loading: false,
  style: {},
  type: 'primary',
  size: null,
  danger: false,
  onClick: () => {},
};

Button.displayName = 'Button';

export default Button;
