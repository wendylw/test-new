import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import { FEEDBACK_STATUS, BUTTONS_STYLE_TYPES } from '../utils';
import './FullScreen.scss';

const FullScreen = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { content, buttons, show, closeButtonContent, className, style, onClose, onModalVisibilityChanged } = props;
  useImperativeHandle(ref, () => ({
    onHistoryBackReceived: () => false,
  }));
  const prevShow = usePrevious(show);
  useEffect(() => {
    if (show !== prevShow) {
      onModalVisibilityChanged(show);
    }
  }, [show, onModalVisibilityChanged, prevShow]);

  if (!show) {
    return null;
  }

  return (
    <div className={`full-screen absolute-wrapper flex flex-column flex-space-between ${className}`} style={style}>
      <div className="full-screen__content">
        <div className="full-screen__body text-center">{content}</div>
      </div>
      <div className="full-screen__button-group padding-small text-center">
        {buttons.map(({ type, content: buttonContent, onClick }) => (
          <button
            key={`full-screen-button-${content}-type`}
            className={`button button__${type} button__block padding-left-right-normal text-uppercase text-weight-bolder`}
            onClick={onClick}
          >
            {buttonContent}
          </button>
        ))}
        {/* TODO： close button UI will be customize */}
        <button
          className="button button__fill button__block padding-left-right-normal text-uppercase text-weight-bolder"
          onClick={onClose}
        >
          {closeButtonContent || t('BackToHome')}
        </button>
      </div>
    </div>
  );
});

FullScreen.displayName = 'FullScreen';

FullScreen.propTypes = {
  status: PropTypes.oneOf(Object.values(FEEDBACK_STATUS)),
  image: PropTypes.node,
  content: PropTypes.node,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(Object.values(BUTTONS_STYLE_TYPES)),
      content: PropTypes.node,
      onClick: PropTypes.func,
    })
  ),
  show: PropTypes.bool,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
  onModalVisibilityChanged: PropTypes.func,
};

FullScreen.defaultProps = {
  status: null,
  image: null,
  content: null,
  buttons: [],
  show: false,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  onModalVisibilityChanged: () => {},
};

export default withBackButtonSupport(FullScreen);
