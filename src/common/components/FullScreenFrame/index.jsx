import React from 'react';
import PropTypes from 'prop-types';
import styles from './FullScreenFrame.module.scss';

/**
 * FullScreenFrame
 * Use this component as a wrapper of any component that uses fix position and
 * covers other components (like Modal or Drawer). It helps you to deal with the
 * component width in different screen size.
 * You should not use fixed position on the wrapped component.
 */
const FullScreenFrame = props => {
  const { children, className, zIndex = 100, backgroundColor } = props;
  return (
    <div className={`${styles.fullScreenFrame} body-scroll-block-fix ${className}`} style={{ zIndex, backgroundColor }}>
      {children}
    </div>
  );
};

FullScreenFrame.displayName = 'FullScreenFrame';
FullScreenFrame.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  zIndex: PropTypes.number,
  backgroundColor: PropTypes.string,
};
FullScreenFrame.defaultProps = {
  className: '',
  children: null,
  zIndex: 100,
  backgroundColor: '',
};

export default FullScreenFrame;
