import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivePointIcon.module.scss';

export const ActivePointIcon = ({ className }) => {
  const classNameList = [styles.ActivePointIcon];

  if (className) {
    classNameList.push(className);
  }

  return <i className={classNameList.join(' ')} />;
};

ActivePointIcon.propTypes = {
  className: PropTypes.string,
};
ActivePointIcon.defaultProps = {
  className: null,
};

ActivePointIcon.displayName = 'ActivePointIcon';
