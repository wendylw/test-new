import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import FullScreenFrame from '../FullScreenFrame';
import styles from './Result.module.scss';
import logger from '../../../utils/monitoring/logger';

const Result = props => {
  const { t } = useTranslation();
  const {
    children,
    show,
    className,
    closeButtonContent,
    closeButtonClassName,
    closeButtonStyle,
    closeByBackButton,
    zIndex,
    onClose,
    onHistoryBackCompleted,
  } = props;
  const contentContainerRef = useRef(null);
  const onHistoryChangeCompleted = useCallback(
    visibility => {
      if (!visibility) {
        onHistoryBackCompleted(visibility);
      }
    },
    [onHistoryBackCompleted]
  );
  const onHistoryBackReceived = useCallback(() => {
    if (closeByBackButton) {
      onClose();
      return true;
    }
    return false;
  }, [onClose, closeByBackButton]);
  useBackButtonSupport({
    visibility: show,
    onHistoryBackReceived,
    onHistoryChangeCompleted,
    disabled: disableBackButtonSupport,
  });

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('Common_Feedback_ShowResult', { text });
      window.newrelic?.addPageAction('feedback.fullScreenFeedback.show', { text });
    }
  }, [children, show]);

  return (
    <FullScreenFrame className="full-screen-feedback" zIndex={zIndex}>
      <div className={`full-screen-feedback__content ${styles.container} ${className}`}>
        {children}
        <div className={styles.fullScreenFeedbackFooter}>
          <Button
            type="primary"
            className={`tw-uppercase${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
            onClick={onClose}
            style={closeButtonStyle}
          >
            {closeButtonContent || t('OK')}
          </Button>
        </div>
      </div>
    </FullScreenFrame>
  );
};

Result.displayName = 'Result';

Result.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  closeByBackButton: PropTypes.bool,
  disableBackButtonSupport: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  closeButtonStyle: PropTypes.object,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
  onHistoryBackCompleted: PropTypes.func,
};

Result.defaultProps = {
  children: null,
  show: false,
  mountAtRoot: false,
  closeButtonContent: null,
  closeByBackButton: false,
  disableBackButtonSupport: false,
  className: '',
  closeButtonClassName: '',
  closeButtonStyle: {},
  zIndex: 400,
  onClose: () => {},
  onHistoryBackCompleted: () => {},
};

export default Result;
