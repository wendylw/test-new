import React from 'react';
import PropTypes from 'prop-types';
import { IconClose } from '../../components/Icons';
import './Alert.scss';

function Alert(props) {
  const { content, closeContent, className, style, close } = props;

  return (
    <div className={`alert ${className}`} style={style}>
      {content}
      <button onClick={() => close()}>{closeContent || <IconClose />}</button>
    </div>
  );
}

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.string,
  closeContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  close: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  closeContent: null,
  className: '',
  style: {},
  close: () => {},
};

export default Alert;
