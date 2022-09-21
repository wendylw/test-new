import React from 'react';
import PropTypes from 'prop-types';
import styles from './Hint.module.scss';

const getClassName = classList => classList.filter(className => !!className).join(' ');

const Hint = props => {
  const { children, className = '', style = {}, color, radiusSize, innerClassName = '' } = props;

  return (
    <i className={getClassName([styles.hint, className, color, radiusSize])} style={style}>
      <span className={`${styles.hintInner} ${innerClassName}`}>{children}</span>
    </i>
  );
};

Hint.displayName = 'Hint';
Hint.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['gray']),
  // If radiusSize is set to 's', the Hint's border radius will be 4px and padding will change to 8px.
  radiusSize: PropTypes.oneOf(['s']),
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
Hint.defaultProps = {
  children: null,
  color: null,
  radiusSize: null,
  className: '',
  innerClassName: '',
  style: {},
};

export default Hint;
