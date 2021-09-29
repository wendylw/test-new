import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import { BUTTONS_STYLE_TYPES } from '../utils';
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
      <div className="full-screen__button-group">
        {buttons.map(({ key, type, className: buttonClassName, content: buttonContent, onClick }) => (
          <div className="margin-small">
            <button
              key={key}
              className={`button button__${type} button__block padding-left-right-normal text-uppercase text-weight-bolder ${buttonClassName ||
                ''}`}
              onClick={onClick}
            >
              {buttonContent}
            </button>
          </div>
        ))}
        {/* TODO： close button UI will be customize */}
        <div className="margin-small">
          <button
            className="button button__fill button__block padding-left-right-normal text-uppercase text-weight-bolder"
            onClick={onClose}
          >
            {closeButtonContent || t('OK')}
          </button>
        </div>
      </div>
    </div>
  );
});

FullScreen.displayName = 'FullScreen';

FullScreen.propTypes = {
  content: PropTypes.node,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      type: PropTypes.oneOf(Object.values(BUTTONS_STYLE_TYPES)),
      className: PropTypes.string,
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
