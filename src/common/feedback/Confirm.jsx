import React from 'react';
import PropTypes from 'prop-types';
import './Confirm.scss';

function Confirm(props) {
  const { content, closeContent, okContent, className, style, onClose, onOk } = props;

  return (
    <div className={`confirm ${className}`} style={style}>
      {content}
      <button onClick={() => onClose()}>{closeContent || `Cancel`}</button>
      <button onClick={() => onOk()}>{okContent || `OK`}</button>
    </div>
  );
}

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  content: PropTypes.string,
  closeContent: PropTypes.node,
  okContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
  onOk: PropTypes.func,
};

Confirm.defaultProps = {
  content: null,
  closeContent: null,
  okContent: null,
  className: '',
  style: {},
  onClose: () => {},
  onOk: () => {},
};

export default Confirm;
