import React from 'react';
import PropTypes from 'prop-types';
import styles from './Tag.module.scss';

const Tag = props => {
  const { children, className = '', style = {} } = props;
  return (
    <i className={`${styles.tag} ${className}`} style={style}>
      <span className={styles.tagInner}>{children}</span>
    </i>
  );
};

Tag.displayName = 'Tag';
Tag.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
Tag.defaultProps = {
  children: null,
  className: '',
  style: {},
};

export default Tag;
