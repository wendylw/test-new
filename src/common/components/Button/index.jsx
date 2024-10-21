import React, { useCallback } from 'react';
import propTypes from 'prop-types';
import Loader from '../Loader';
import styles from './Button.module.scss';

const Button = props => {
  const {
    children,
    className = '',
    contentClassName = '',
    style = {},
    type = 'primary',
    size = 'normal',
    theme = 'default',
    buttonType = 'submit',
    block = false,
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
      className={`${styles.button} type-${type}${theme ? `-${theme}` : ''}${size ? ` size-${size}` : ''}${
        block ? ' tw-w-full' : ''
      } ${className}`}
      style={style}
      data-test-id="common.button.btn"
      type={buttonType}
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
      <div className={`${styles.buttonContent}${contentClassName ? ` ${contentClassName}` : ''}`}>{children}</div>
    </button>
  );
};

Button.propTypes = {
  children: propTypes.node,
  className: propTypes.string,
  contentClassName: propTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: propTypes.object,
  icon: propTypes.element,
  loading: propTypes.bool,
  type: propTypes.oneOf(['primary', 'secondary', 'text']),
  size: propTypes.oneOf(['small', 'normal']),
  theme: propTypes.oneOf(['default', 'danger', 'info', 'ghost']),
  buttonType: propTypes.oneOf(['submit', 'button', 'reset']),
  // The size and placement of buttons can change as parent containers, such as cards, adapt for larger screens.
  block: propTypes.bool,
  onClick: propTypes.func,
};

Button.defaultProps = {
  children: null,
  className: '',
  contentClassName: '',
  icon: null,
  loading: false,
  style: {},
  type: 'primary',
  size: 'normal',
  theme: 'default',
  buttonType: 'submit',
  block: false,
  onClick: () => {},
};

Button.displayName = 'Button';

export default Button;
