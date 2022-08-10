import React, { useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { WarningCircle } from 'phosphor-react';
import './toast-animation.scss';
import styles from './Toast.module.scss';
import logger from '../../../utils/monitoring/logger';

const MESSAGE_TYPE_MAPPING = {
  success: {
    key: 'success',
  },
  error: {
    key: 'error',
    icon: <WarningCircle className={styles.ToastIcon} weight="fill" />,
  },
  warning: {
    key: 'warning',
  },
  info: {
    key: 'info',
  },
};
const DEFAULT_DURATION = 3000;
const Toast = forwardRef(props => {
  const { children, icon, type, duration, show, onClose, className, style } = props;
  const timeoutRef = useRef(null);
  const contentContainerRef = useRef(null);
  const iconNode = icon || (type && MESSAGE_TYPE_MAPPING[type].icon) || null;
  useEffect(() => {
    if (show) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [show]);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('feedback.toast.show', { text });
      window.newrelic?.addPageAction('feedback.toast.show', { text });
    }
  }, [children, show]);

  return (
    <CSSTransition in={show} timeout={300} unmountOnExit classNames="toast-animation">
      <div className={`${styles.ToastContent} ${type} toast-animation__content ${className}`} style={style}>
        {iconNode}
        <span className={styles.ToastText} ref={contentContainerRef}>
          {children}
        </span>
      </div>
    </CSSTransition>
  );
});

Toast.displayName = 'Toast';

Toast.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  type: PropTypes.oneOf(Object.keys(MESSAGE_TYPE_MAPPING)),
  // number of milliseconds to show the toast
  duration: PropTypes.number,
  show: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
};

Toast.defaultProps = {
  children: null,
  icon: null,
  type: null,
  duration: DEFAULT_DURATION,
  show: false,
  className: '',
  style: {},
  onClose: () => {},
};

export default Toast;
