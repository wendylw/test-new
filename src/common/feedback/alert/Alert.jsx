import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import './Alert.scss';

function Alert(props) {
  const { t, content, show, closeButtonContent, className, style, onClose } = props;

  if (!show) {
    return null;
  }

  return (
    <div className={`alert absolute-wrapper flex flex-column flex-middle flex-center ${className}`} style={style}>
      <div className="alert__content border-radius-large">
        <div className="alert__body text-center">{content}</div>
        <div className="padding-small">
          <button className="button button__fill button__block text-weight-bolder" onClick={() => onClose()}>
            {closeButtonContent || t('OK')}
          </button>
        </div>
      </div>
    </div>
  );
}

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.node,
  show: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  show: false,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
};

export default withTranslation()(Alert);
