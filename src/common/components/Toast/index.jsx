import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { CheckCircle, WarningCircle, Info } from 'phosphor-react';
import { FEEDBACK_STATUS, TOAST_DEFAULT_DURATION } from '../../utils/feedback/utils';
import './toast-animation.scss';
import styles from './Toast.module.scss';
import logger from '../../../utils/monitoring/logger';

const MESSAGE_TYPE_MAPPING = {
  success: {
    key: FEEDBACK_STATUS.SUCCESS,
    icon: <CheckCircle className={styles.ToastIcon} weight="fill" />,
  },
  error: {
    key: FEEDBACK_STATUS.ERROR,
    icon: <WarningCircle className={styles.ToastIcon} weight="fill" />,
  },
  warning: {
    key: FEEDBACK_STATUS.WARNING,
    icon: <WarningCircle className={styles.ToastIcon} weight="fill" />,
  },
  info: {
    key: FEEDBACK_STATUS.INFO,
    icon: <Info className={styles.ToastIcon} weight="fill" />,
  },
};
const Toast = props => {
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
  }, [duration, onClose, show]);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('Common_Feedback_ShowToast', { message: text });
    }
  }, [children, show]);

  return (
    <CSSTransition in={show} timeout={300} unmountOnExit classNames="toast-animation">
      <div className={`${styles.ToastContainer} toast-animation__content ${className}`}>
        <div className={`${styles.ToastContent} ${type}`} style={style}>
          {iconNode}
          <span className={styles.ToastText} ref={contentContainerRef}>
            {children}
          </span>
        </div>
      </div>
    </CSSTransition>
  );
};

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
  duration: TOAST_DEFAULT_DURATION,
  show: false,
  className: '',
  style: {},
  onClose: () => {},
};

export default Toast;
