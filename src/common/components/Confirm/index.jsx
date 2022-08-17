import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import styles from './Confirm.module.scss';
import logger from '../../../utils/monitoring/logger';

const Confirm = props => {
  const { children, show, mountAtRoot, animation, className, footer, zIndex, onClose } = props;
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
      {footer}
    </Modal>
  );
};

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  animation: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  className: PropTypes.string,
  footer: PropTypes.node,
  zIndex: PropTypes.number,
  onClose: PropTypes.func,
};

Confirm.defaultProps = {
  children: null,
  show: false,
  animation: true,
  mountAtRoot: false,
  className: '',
  footer: null,
  zIndex: 300,
  onClose: () => {},
};

export default Confirm;
