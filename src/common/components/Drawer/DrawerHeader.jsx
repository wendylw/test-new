import React from 'react';
import PropTypes from 'prop-types';
import styles from './DrawerHeader.module.scss';

const DrawerHeader = props => {
  const { left, right, children, className } = props;
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={`${styles.buttonContainer} ${styles.left}`}>{left}</div>
      <div>{children}</div>
      <div className={`${styles.buttonContainer} ${styles.right}`}>{right}</div>
    </header>
  );
};

DrawerHeader.displayName = 'DrawerHeader';
DrawerHeader.propTypes = {
  className: PropTypes.string,
  left: PropTypes.node,
  right: PropTypes.node,
  children: PropTypes.node,
};
DrawerHeader.defaultProps = {
  className: '',
  left: null,
  right: null,
  children: null,
};

export default DrawerHeader;
