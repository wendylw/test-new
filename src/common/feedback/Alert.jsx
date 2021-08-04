import React from 'react';
import PropTypes from 'prop-types';
import { IconClose } from '../../components/Icons';
import './Alert.scss';

function Alert(props) {
  const { content, buttonContent, className, style, close } = props;

  return (
    <div className={`${className ? ` ${className}` : ''}`} style={style}>
      {content}
      <button onClick={() => close()}>{buttonContent || <IconClose />}</button>
    </div>
  );
}

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.string,
  buttonContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  close: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  buttonContent: null,
  className: null,
  style: {},
  close: () => {},
};

export default Alert;
