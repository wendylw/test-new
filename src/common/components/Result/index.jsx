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
    mountAtRoot,
    isFullScreen,
    show,
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
      logger.log('Common_Feedback_ShowResult', { message: text });
    }
  }, [children, show]);

  const renderContent = (
    <>
      {header}
      <div className={`${styles.result} ${className}`}>
        <div ref={contentContainerRef} className={styles.resultContent}>
          {children}
          <div className={styles.resultFooter}>
            <Button
              type="primary"
              size="small"
              className={`${styles.closeButtonClassName} tw-uppercase${
                closeButtonClassName ? ` ${closeButtonClassName}` : ''
              }`}
              onClick={onClose}
              style={closeButtonStyle}
              data-test-id="common.result.close-btn"
            >
              {closeButtonContent || t('Okay')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
  const fullScreenResult = (
    <FullScreenFrame className="tw-bg-white" zIndex={zIndex}>
      {renderContent}
    </FullScreenFrame>
  );

  if (mountAtRoot) {
    return createPortal(fullScreenResult, document.getElementById('modal-mount-point'));
  }

  return isFullScreen ? fullScreenResult : renderContent;
};

Result.displayName = 'Result';

Result.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  isFullScreen: PropTypes.bool,
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
  isFullScreen: false,
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
