import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import { CONFIRM_BUTTON_ALIGNMENT } from '../../utils/feedback/utils';
import styles from './ConfirmFooter.module.scss';

const ConfirmFooter = props => {
  const { t } = useTranslation();
  const {
    closeButtonContent,
    closeButtonClassName,
    closeButtonStyle,
    confirmButtonContent,
    confirmButtonClassName,
    confirmButtonStyle,
    buttonAlignment,
    onClose,
    onConfirm,
  } = props;

  return (
    <div className={`${styles.confirmFooter} ${buttonAlignment}`}>
      {buttonAlignment === CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL ? (
        <Button
          type="secondary"
          className={`tw-flex-1 tw-uppercase${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
          onClick={onClose}
          style={closeButtonStyle}
        >
          {closeButtonContent || t('ConfirmCloseButtonText')}
        </Button>
      ) : null}
      <Button
        type="primary"
        className={`tw-flex-1 tw-uppercase${confirmButtonClassName ? ` ${confirmButtonClassName}` : ''}`}
        onClick={() => {
          onConfirm();
          onClose();
        }}
        style={confirmButtonStyle}
      >
        {confirmButtonContent || t('Confirm')}
      </Button>
      {buttonAlignment === CONFIRM_BUTTON_ALIGNMENT.VERTICAL ? (
        <Button
          type="text"
          className={`tw-w-full tw-uppercase${closeButtonClassName ? ` ${closeButtonClassName}` : ''}`}
          onClick={onClose}
          style={closeButtonStyle}
        >
          {closeButtonContent || t('ConfirmCloseButtonText')}
        </Button>
      ) : null}
    </div>
  );
};

ConfirmFooter.displayName = 'ConfirmFooter';

ConfirmFooter.propTypes = {
  closeButtonContent: PropTypes.node,
  closeButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  closeButtonStyle: PropTypes.object,
  confirmButtonContent: PropTypes.node,
  confirmButtonClassName: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  confirmButtonStyle: PropTypes.object,
  buttonAlignment: PropTypes.oneOf(Object.values(CONFIRM_BUTTON_ALIGNMENT)),
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};

ConfirmFooter.defaultProps = {
  closeButtonContent: null,
  closeButtonClassName: '',
  closeButtonStyle: {},
  confirmButtonContent: null,
  confirmButtonClassName: '',
  confirmButtonStyle: {},
  buttonAlignment: CONFIRM_BUTTON_ALIGNMENT.HORIZONTAL,
  onClose: () => {},
  onConfirm: () => {},
};

export default ConfirmFooter;
