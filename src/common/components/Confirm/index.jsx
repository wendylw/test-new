import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import Button from '../Button';
import styles from './Confirm.module.scss';
import logger from '../../../utils/monitoring/logger';

const Confirm = props => {
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
    confirmButtonContent,
    confirmButtonClassName,
    confirmButtonStyle,
    zIndex,
    onClose,
  } = props;
  const contentContainerRef = useRef(null);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('feedback.confirm.show', { text });
      window.newrelic?.addPageAction('feedback.confirm.show', { text });
    }
  }, [children, show]);

  return (
    <Modal
      show={show}
      mountAtRoot={mountAtRoot}
      className={`${styles.confirmContent}${className ? ` ${className}` : ''}`}
      onClose={onClose}
      closeByBackButton={false}
      closeByBackDrop={false}
      animation={animation}
      zIndex={zIndex}
    >
      <div ref={contentContainerRef}>{children}</div>
      <div className={styles.confirmFooter}>
        <Button
          type="secondary"
          className={`tw-flex-1 tw-uppercase${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
          onClick={onClose}
          style={closeButtonStyle}
        >
          {closeButtonContent || t('ConfirmCloseButtonText')}
        </Button>
        <Button
          type="primary"
          className={`tw-flex-1 tw-uppercase${confirmButtonClassName ? ` ${confirmButtonClassName}` : ''}`}
          onClick={onClose}
          style={confirmButtonStyle}
        >
          {confirmButtonContent || t('Confirm')}
        </Button>
      </div>
    </Modal>
  );
};

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  animation: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  closeButtonStyle: PropTypes.object,
  confirmButtonContent: PropTypes.node,
  confirmButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  confirmButtonStyle: PropTypes.object,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
};

Confirm.defaultProps = {
  children: null,
  show: false,
  animation: true,
  mountAtRoot: false,
  closeButtonContent: null,
  className: '',
  closeButtonClassName: '',
  closeButtonStyle: {},
  confirmButtonContent: null,
  confirmButtonClassName: '',
  confirmButtonStyle: {},
  zIndex: 300,
  onClose: () => {},
};

export default Confirm;
