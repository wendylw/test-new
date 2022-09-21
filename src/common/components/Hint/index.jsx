import React from 'react';
import PropTypes from 'prop-types';
import styles from './Hint.module.scss';

const getClassName = classList => classList.filter(className => !!className).join(' ');

const Hint = props => {
  const { icon, className = '', style = {}, color, radiusSize, content } = props;

  return (
    <div className={getClassName([styles.hint, className, color, radiusSize])} style={style}>
      {icon}
      <span className={styles.hintInner}>{content}</span>
    </div>
  );
};

Hint.displayName = 'Hint';
Hint.propTypes = {
  icon: PropTypes.node,
  color: PropTypes.oneOf(['gray']),
  // If radiusSize is set to 's', the Hint's border radius will be 4px and padding will change to 8px.
  radiusSize: PropTypes.oneOf(['s']),
  className: PropTypes.string,
  content: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
Hint.defaultProps = {
  icon: null,
  color: null,
  radiusSize: null,
  className: '',
  content: '',
  style: {},
};

export default Hint;
