import React from 'react';
import PropTypes from 'prop-types';
import styles from './DrawerHeader.module.scss';

const DrawerHeader = props => {
  const { left, right, children, className, titleClassName } = props;
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={`${styles.buttonContainer} ${styles.left}`}>{left}</div>
      <div className={titleClassName}>{children}</div>
      <div className={`${styles.buttonContainer} ${styles.right}`}>{right}</div>
    </header>
  );
};

DrawerHeader.displayName = 'DrawerHeader';
DrawerHeader.propTypes = {
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  left: PropTypes.node,
  right: PropTypes.node,
  children: PropTypes.node,
};
DrawerHeader.defaultProps = {
  className: '',
  titleClassName: '',
  left: null,
  right: null,
  children: null,
};

export default DrawerHeader;
