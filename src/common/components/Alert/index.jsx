import React, { useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import Button from '../Button';
import styles from './Alert.module.scss';
import logger from '../../../utils/monitoring/logger';

const Alert = forwardRef(props => {
  const { t } = useTranslation();
  const { children, show, animation, closeButtonContent, className, zIndex, onClose } = props;
  const contentContainerRef = useRef(null);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('feedback.alert.show', { text });
      window.newrelic?.addPageAction('feedback.alert.show', { text });
    }
  }, [children, show]);

  return (
    <Modal
      show={show}
      className={`${styles.alertContent}${className ? ` ${className}` : ''}`}
      onClose={onClose}
      closeByBackButton={false}
      closeByBackDrop={false}
      animation={animation}
      zIndex={zIndex}
      disableBackButtonSupport
    >
      <div ref={contentContainerRef}>{children}</div>
      <div className={styles.alertFooter}>
        <Button type="primary" className="tw-w-full tw-uppercase" onClick={onClose}>
          {closeButtonContent || t('OK')}
        </Button>
      </div>
    </Modal>
  );
});

Alert.displayName = 'Alert';

Alert.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  animation: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  children: null,
  show: false,
  animation: true,
  closeButtonContent: null,
  className: '',
  zIndex: 300,
  onClose: () => {},
};

export default Alert;
