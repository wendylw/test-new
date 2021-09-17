import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { usePrevious } from 'react-use';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { withBackButtonSupport } from '../../../utils/modal-back-button-support';
import './Alert.scss';

const Alert = (props, ref) => {
  const { t } = useTranslation();
  const { content, show, title, closeButtonContent, className, style, onClose, onModalVisibilityChanged } = props;
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
    <div className={`alert absolute-wrapper flex flex-column flex-middle flex-center ${className}`} style={style}>
      <div className="alert__content border-radius-large">
        <div className="alert__body text-center">
          {title ? <h4 className="padding-small text-size-biggest text-weight-bolder">{title}</h4> : null}
          {typeof content === 'string' ? <p className="modal__text  padding-top-bottom-small">{content}</p> : content}
        </div>
        <div className="padding-small">
          <button className="button button__fill button__block text-weight-bolder" onClick={onClose}>
            {closeButtonContent || t('OK')}
          </button>
        </div>
      </div>
    </div>
  );
};

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.node,
  show: PropTypes.bool,
  title: PropTypes.string,
  closeButtonContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  onClose: PropTypes.func,
  onModalVisibilityChanged: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  show: false,
  title: null,
  closeButtonContent: null,
  className: '',
  style: {},
  onClose: () => {},
  onModalVisibilityChanged: () => {},
};

export default withBackButtonSupport(forwardRef(Alert));
