import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TOAST_DEFAULT_DURATION } from '../../utils/feedback/utils';
import { getClassName } from '../../utils/ui';
import styles from './PageToast.module.scss';

const PageToast = props => {
  const { children, icon, duration, show, onClose, className, style } = props;
  const timeoutRef = useRef(null);
  const contentContainerRef = useRef(null);

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

  return (
    <div className={getClassName([styles.PageToastContainer, className])}>
      <div className={styles.PageToastContent} style={style}>
        {icon}
        <span className={styles.PageToastText} ref={contentContainerRef}>
          {children}
        </span>
      </div>
    </div>
  );
};

PageToast.displayName = 'PageToast';

PageToast.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  // number of milliseconds to show the toast
  duration: PropTypes.number,
  show: PropTypes.bool,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
};

PageToast.defaultProps = {
  children: null,
  icon: null,
  duration: TOAST_DEFAULT_DURATION,
  show: false,
  className: '',
  style: {},
  onClose: () => {},
};

export default PageToast;
