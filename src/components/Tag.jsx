import React from 'react';
import PropTypes from 'prop-types';
import './Tag.scss';

/**
 * `<Tag />` is used on the product items and store items.
 *
 * A very simple example is by `className="tag tag__primary"` is used with component
 */
const Tag = props => {
  const { text, className, style } = props;
  const classList = ['tag text-uppercase text-weight-bolder'];

  if (className) {
    classList.push(className);
  }

  if (!text) {
    return null;
  }

  return (
    <i className={classList.join(' ')} style={style}>
      {text}
    </i>
  );
};

Tag.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

Tag.defaultProps = {
  className: '',
  text: '',
  style: {},
};

Tag.displayName = 'Tag';

export default Tag;
