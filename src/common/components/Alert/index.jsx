import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import Button from '../Button';
import styles from './Alert.module.scss';
import logger from '../../../utils/monitoring/logger';

const Alert = props => {
  const { t } = useTranslation();
  const {
    children,
    show,
    mountAtRoot,
    animation,
    closeButtonContent,
    className,
    closeButtonClassName,
    closeButtonStyle,
    zIndex,
    onClose,
    onHistoryBackCompleted,
  } = props;
  const contentContainerRef = useRef(null);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('Common_Feedback_ShowAlert', { text });
      window.newrelic?.addPageAction('feedback.alert.show', { text });
    }
  }, [children, show]);

  return (
    <Modal
      show={show}
      mountAtRoot={mountAtRoot}
      className={`${styles.alertContent}${className ? ` ${className}` : ''}`}
      onClose={onClose}
      onHistoryBackCompleted={onHistoryBackCompleted}
      closeByBackButton={false}
      closeByBackDrop={false}
      animation={animation}
      zIndex={zIndex}
    >
      <div ref={contentContainerRef}>{children}</div>
      <div className={styles.alertFooter}>
        <Button
          block
          type="primary"
          className={`${styles.alertFooterButton}${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
          onClick={onClose}
          style={closeButtonStyle}
        >
          {closeButtonContent || t('OKay')}
        </Button>
      </div>
    </Modal>
  );
};

Alert.displayName = 'Alert';

Alert.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  animation: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  closeButtonStyle: PropTypes.object,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
  onHistoryBackCompleted: PropTypes.func,
};

Alert.defaultProps = {
  children: null,
  show: false,
  animation: true,
  mountAtRoot: false,
  closeButtonContent: null,
  className: '',
  closeButtonClassName: '',
  closeButtonStyle: {},
  zIndex: 300,
  onClose: () => {},
  onHistoryBackCompleted: () => {},
};

export default Alert;
