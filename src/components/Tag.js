import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Tag extends Component {
  render() {
    const { text, className, style } = this.props;
    const classList = ['text-uppercase font-weight-bold'];

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
  }
}

Tag.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  style: PropTypes.object,
};

Tag.defaultProps = {
  text: '',
  style: {},
};

export default Tag;
