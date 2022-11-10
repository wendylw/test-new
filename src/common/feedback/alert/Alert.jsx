import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import './Alert.scss';
import logger from '../../../utils/monitoring/logger';

const Alert = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    content,
    show,
    closeButtonContent,
    className,
    style,
    onClose,
    onModalVisibilityChanged,
    onModalHashChanged,
  } = props;
  const [processing, setProcessing] = useState(false);
  useImperativeHandle(ref, () => ({
    onHistoryBackReceived: () => false,
  }));
  const contentContainerRef = useRef(null);
  const prevShow = usePrevious(show);
  useEffect(() => {
    if (show !== prevShow) {
      const callOnModalVisibilityChanged = async () => {
        await onModalVisibilityChanged(show);
        if (onModalHashChanged) {
          onModalHashChanged(show);
        }
      };
      callOnModalVisibilityChanged();
    }

    return () => {
      setProcessing(false);
    };
  }, [show, onModalVisibilityChanged, onModalHashChanged, prevShow]);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('Common_Feedback_ShowAlert', { text });
      window.newrelic?.addPageAction('feedback.alert.show', { text });
    }
  }, [content, show]);

  if (!show) {
    return null;
  }

  return (
    <div className={`alert absolute-wrapper flex flex-column flex-middle flex-center ${className}`} style={style}>
      <div className="alert__content border-radius-large">
        <div ref={contentContainerRef} className="alert__body text-center padding-small">
          {content}
        </div>
        <div className="alert__buttons-group padding-small">
          {/* TODO： close button UI will be customize */}
          <button
            className="alert__button button button__fill button__block text-uppercase text-weight-bolder"
            onClick={() => {
              setProcessing(true);
              onClose();
            }}
            disabled={processing}
          >
            {processing ? t('Processing') : closeButtonContent || t('OK')}
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
  onModalHashChanged: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  show: false,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  onModalVisibilityChanged: () => {},
  onModalHashChanged: () => {},
};

export default withBackButtonSupport(Alert);
