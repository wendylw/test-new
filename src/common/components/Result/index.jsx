import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import Button from '../Button';
import FullScreenFrame from '../FullScreenFrame';
import styles from './Result.module.scss';
import logger from '../../../utils/monitoring/logger';

const Result = props => {
  const { t } = useTranslation();
  const {
    header,
    children,
    show,
    mountAtRoot,
    className,
    closeButtonContent,
    closeButtonClassName,
    closeButtonStyle,
    closeByBackButton,
    zIndex,
    onClose,
    onHistoryBackCompleted,
    disableBackButtonSupport,
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
      window.newrelic?.addPageAction('feedback.result.show', { text });
    }
  }, [children, show]);

  const renderContent = (
    <div className={`${styles.resultContent} ${className}`}>
      {children}
      <div className={styles.resultFooter}>
        <Button
          type="secondary"
          className={`${styles.closeButtonClassName} tw-uppercase${
            closeButtonClassName ? ` ${closeButtonClassName}` : ''
          }`}
          onClick={onClose}
          style={closeButtonStyle}
          size="small"
        >
          {closeButtonContent || t('OK')}
        </Button>
        <Button
          type="primary"
          className={`${styles.closeButtonClassName} tw-uppercase${
            closeButtonClassName ? ` ${closeButtonClassName}` : ''
          }`}
          onClick={onClose}
          style={closeButtonStyle}
          size="small"
        >
          {closeButtonContent || t('OK')}
        </Button>
      </div>
    </div>
  );

  if (mountAtRoot) {
    return createPortal(
      <FullScreenFrame className="tw-bg-white" zIndex={zIndex}>
        {header}
        {renderContent}
      </FullScreenFrame>,
      document.getElementById('modal-mount-point')
    );
  }

  return renderContent;
};

Result.displayName = 'Result';

Result.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  show: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  closeByBackButton: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  closeButtonStyle: PropTypes.object,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
  onHistoryBackCompleted: PropTypes.func,
  disableBackButtonSupport: PropTypes.bool,
};

Result.defaultProps = {
  header: null,
  children: null,
  show: false,
  mountAtRoot: false,
  closeButtonContent: null,
  closeByBackButton: false,
  className: '',
  closeButtonClassName: '',
  closeButtonStyle: {},
  zIndex: 400,
  onClose: () => {},
  onHistoryBackCompleted: () => {},
  disableBackButtonSupport: false,
};

export default Result;
