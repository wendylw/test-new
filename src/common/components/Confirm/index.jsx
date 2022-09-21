import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CONFIRM_BUTTON_ALIGNMENT, CONFIRM_TRIGGER_TARGET } from '../../utils/feedback/utils';
import Modal from '../Modal';
import Button from '../Button';
import styles from './Confirm.module.scss';
import logger from '../../../utils/monitoring/logger';

const ConfirmFooterPropsTypes = {
  cancelButtonContent: PropTypes.node,
  cancelButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  cancelButtonStyle: PropTypes.object,
  confirmButtonContent: PropTypes.node,
  confirmButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  confirmButtonStyle: PropTypes.object,
  buttonAlignment: PropTypes.oneOf(Object.values(CONFIRM_BUTTON_ALIGNMENT)),
  onSelection: PropTypes.func,
};

const ConfirmFooterDefaultProps = {
  cancelButtonContent: null,
  cancelButtonClassName: '',
  cancelButtonStyle: {},
  confirmButtonContent: null,
  confirmButtonClassName: '',
  confirmButtonStyle: {},
  buttonAlignment: CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL,
  // target is one of CONFIRM_TRIGGER_TARGET
  onSelection: target => {},
};

const ConfirmFooter = props => {
  const { t } = useTranslation();
  const {
    cancelButtonContent,
    cancelButtonClassName,
    cancelButtonStyle,
    confirmButtonContent,
    confirmButtonClassName,
    confirmButtonStyle,
    buttonAlignment,
    onSelection,
  } = props;

  return (
    <div className={`${styles.confirmFooter} ${buttonAlignment}`}>
      {buttonAlignment === CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL ? (
        <Button
          type="secondary"
          className={`tw-flex-1 tw-uppercase${cancelButtonClassName ? ` ${cancelButtonClassName}` : ''}`}
          onClick={() => {
            onSelection(CONFIRM_TRIGGER_TARGET.CANCEL);
          }}
          style={cancelButtonStyle}
        >
          {cancelButtonContent || t('Cancel')}
        </Button>
      ) : null}
      <Button
        type="primary"
        className={`tw-flex-1 tw-uppercase${confirmButtonClassName ? ` ${confirmButtonClassName}` : ''}`}
        onClick={() => {
          onSelection(CONFIRM_TRIGGER_TARGET.CONFIRM);
        }}
        style={confirmButtonStyle}
      >
        {confirmButtonContent || t('OK')}
      </Button>
      {buttonAlignment === CONFIRM_BUTTON_ALIGNMENT.VERTICAL ? (
        <Button
          type="text"
          className={`${styles.confirmVerticalCloseButton} tw-flex-1${
            cancelButtonClassName ? ` ${cancelButtonClassName}` : ''
          }`}
          onClick={() => {
            onSelection(CONFIRM_TRIGGER_TARGET.CANCEL);
          }}
          style={cancelButtonStyle}
        >
          {cancelButtonContent || t('ConfirmCloseButtonText')}
        </Button>
      ) : null}
    </div>
  );
};

ConfirmFooter.displayName = 'ConfirmFooter';
ConfirmFooter.propTypes = ConfirmFooterPropsTypes;
ConfirmFooter.defaultProps = ConfirmFooterDefaultProps;

const Confirm = props => {
  const {
    children,
    show,
    mountAtRoot,
    animation,
    className,
    cancelButtonContent,
    cancelButtonClassName,
    cancelButtonStyle,
    confirmButtonContent,
    confirmButtonClassName,
    closeByBackButton,
    closeByBackDrop,
    confirmButtonStyle,
    buttonAlignment,
    zIndex,
    onSelection,
    onHistoryBackCompleted,
  } = props;
  const contentContainerRef = useRef(null);

  useEffect(() => {
    if (show && contentContainerRef.current) {
      const text = contentContainerRef.current.innerText;
      logger.log('Common_Feedback_ShowConfirm', { text });
      window.newrelic?.addPageAction('feedback.confirm.show', { text });
    }
  }, [children, show]);

  return (
    <Modal
      show={show}
      mountAtRoot={mountAtRoot}
      className={`${styles.confirmContent}${className ? ` ${className}` : ''}`}
      onClose={() => {
        onSelection(CONFIRM_TRIGGER_TARGET.OTHER);
      }}
      onHistoryBackCompleted={onHistoryBackCompleted}
      closeByBackButton={closeByBackButton}
      closeByBackDrop={closeByBackDrop}
      animation={animation}
      zIndex={zIndex}
    >
      <div ref={contentContainerRef}>{children}</div>
      <ConfirmFooter
        cancelButtonContent={cancelButtonContent}
        cancelButtonClassName={cancelButtonClassName}
        cancelButtonStyle={cancelButtonStyle}
        confirmButtonContent={confirmButtonContent}
        confirmButtonClassName={confirmButtonClassName}
        confirmButtonStyle={confirmButtonStyle}
        buttonAlignment={buttonAlignment}
        onSelection={target => onSelection(target)}
      />
    </Modal>
  );
};

Confirm.displayName = 'Confirm';

Confirm.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool,
  closeByBackButton: PropTypes.bool,
  closeByBackDrop: PropTypes.bool,
  animation: PropTypes.bool,
  mountAtRoot: PropTypes.bool,
  className: PropTypes.string,
  zIndex: PropTypes.number,
  onHistoryBackCompleted: PropTypes.func,
  ...ConfirmFooterPropsTypes,
};

Confirm.defaultProps = {
  children: null,
  show: false,
  animation: true,
  closeByBackButton: false,
  closeByBackDrop: false,
  mountAtRoot: false,
  className: '',
  zIndex: 300,
  onHistoryBackCompleted: () => {},
  ...ConfirmFooterDefaultProps,
};

export default Confirm;
