import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
// import { IconClose } from '../../../components/Icons';
import './Alert.scss';

function Alert(props) {
  const { content, closeContent, className, style, close } = props;

  return (
    <div className={`alert absolute-wrapper flex flex-column flex-middle flex-center ${className}`} style={style}>
      <div className="alert__content border-radius-large">
        <div className="alert__body text-center">{content}</div>
        <button className="button button__fill button__block text-weight-bolder" onClick={() => close()}>
          {closeContent || t('OK')}
        </button>
      </div>
    </div>
  );
}

Alert.displayName = 'Alert';

Alert.propTypes = {
  content: PropTypes.string,
  closeContent: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  close: PropTypes.func,
};

Alert.defaultProps = {
  content: null,
  closeContent: null,
  className: '',
  style: {},
  close: () => {},
};

export default Alert;
