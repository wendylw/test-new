import React from 'react';
import PropTypes from 'prop-types';
import styles from './Tag.module.scss';

const getClassName = classList => classList.filter(className => !!className).join(' ');

const Tag = props => {
  const { children, className = '', style = {}, color, radiusSize } = props;

  return (
    <i className={getClassName([styles.tag, className, color, radiusSize])} style={style}>
      <span className={styles.tagInner}>{children}</span>
    </i>
  );
};

Tag.displayName = 'Tag';
Tag.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['red', 'pink', 'cyan', 'green']),
  // If radiusSize is set to 'xs', the tag's border radius will be 2px and padding will change to 4px.
  radiusSize: PropTypes.oneOf(['xs']),
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
Tag.defaultProps = {
  children: null,
  color: null,
  radiusSize: null,
  className: '',
  style: {},
};

export default Tag;
