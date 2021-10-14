import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import './Alert.scss';

const Alert = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { content, show, closeButtonContent, className, style, onClose, onModalVisibilityChanged } = props;
  useImperativeHandle(ref, () => ({
    onHistoryBackReceived: () => false,
  }));
  const prevShow = usePrevious(show);
  useEffect(() => {
    if (show !== prevShow) {
      onModalVisibilityChanged(show);
    }
  }, [show, onModalVisibilityChanged, prevShow]);

  if (!show) {
    return null;
  }

  return (
    <div className={`alert absolute-wrapper flex flex-column flex-middle flex-center ${className}`} style={style}>
      <div className="alert__content border-radius-large">
        <div className="alert__body text-center padding-small">{content}</div>
        <div className="padding-small">
          {/* TODO： close button UI will be customize */}
          <button className="button button__fill button__block text-weight-bolder" onClick={onClose}>
            {closeButtonContent || t('Continue')}
          </button>
        </div>
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.node,
  show: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
  onModalVisibilityChanged: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  show: false,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  onModalVisibilityChanged: () => {},
};

export default withBackButtonSupport(Alert);
