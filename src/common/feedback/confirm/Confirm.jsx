import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import './Confirm.scss';

function Confirm(props) {
  const { t, content, closeButtonContent, okContent, className, style, onClose } = props;

  return (
    <div className={`confirm ${className}`} style={style}>
      {content}
      <button onClick={() => onClose('cancel')}>{closeButtonContent || t('Cancel')}</button>
      <button onClick={() => onClose('ok')}>{okContent || t('OK')}</button>
    </div>
  );
}

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  content: PropTypes.string,
  closeButtonContent: PropTypes.node,
  okContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
};

Confirm.defaultProps = {
  content: null,
  closeButtonContent: null,
  okContent: null,
  className: '',
  style: {},
  onClose: () => {},
};

export default withTranslation()(Confirm);
