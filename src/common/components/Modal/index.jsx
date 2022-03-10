import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { useBackButtonSupport } from '../../../utils/modal-back-button-support';
import FullScreenFrame from '../FullScreenFrame';
import styles from './Modal.module.scss';
import './modal-animation.scss';
import useScrollBlock from '../../utils/hooks/useScrollBlock';

const Modal = props => {
  const {
    children,
    show = false,
    className = '',
    onClose = () => {},
    closeByBackButton = true,
    closeByBackDrop = false,
    animation = true,
    zIndex = 100,
    mountAtRoot = true,
    onHistoryBackCompleted = () => {},
    disableBackButtonSupport = false,
  } = props;
  const onHistoryBackReceived = useCallback(() => {
    if (closeByBackButton) {
      onClose();
      return true;
    }
    return false;
  }, [onClose, closeByBackButton]);
  const onHistoryChangeCompleted = useCallback(
    visibility => {
      if (!visibility) {
        onHistoryBackCompleted(visibility);
      }
    },
    [onHistoryBackCompleted]
  );
  useBackButtonSupport({
    visibility: show,
    onHistoryBackReceived,
    onHistoryChangeCompleted,
    disabled: disableBackButtonSupport,
  });

  useScrollBlock(show);
  const onBackdropClick = useCallback(
    e => {
      if (show && closeByBackDrop && e.target?.className?.includes?.(styles.backdrop)) {
        onClose && onClose();
      }
    },
    [show, onClose, closeByBackDrop]
  );
  const modalContent = (
    <FullScreenFrame className="modal-animation" zIndex={zIndex}>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className={`modal-animation__backdrop ${styles.backdrop}`} onClick={onBackdropClick}>
        <div className={`modal-animation__content ${styles.container} ${className}`}>{children}</div>
      </div>
    </FullScreenFrame>
  );

  let renderContent = null;

  if (!animation) {
    renderContent = show ? modalContent : null;
  } else {
    renderContent = (
      <CSSTransition in={show} timeout={300} unmountOnExit classNames="modal-animation">
        {modalContent}
      </CSSTransition>
    );
  }

  if (mountAtRoot) {
    return createPortal(renderContent, document.getElementById('modal-mount-point'));
  }
  return renderContent;
};

Modal.displayName = 'Modal';

Modal.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
  closeByBackButton: PropTypes.bool,
  closeByBackDrop: PropTypes.bool,
  animation: PropTypes.bool,
  zIndex: PropTypes.number,
  mountAtRoot: PropTypes.bool,
  onHistoryBackCompleted: PropTypes.func,
  disableBackButtonSupport: PropTypes.bool,
};
Modal.defaultProps = {
  children: null,
  show: false,
  className: '',
  onClose: () => {},
  closeByBackButton: true,
  closeByBackDrop: false,
  animation: true,
  zIndex: 100,
  mountAtRoot: true,
  onHistoryBackCompleted: () => {},
  disableBackButtonSupport: false,
};

export default Modal;
