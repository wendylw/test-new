import React from 'react';
import PropTypes from 'prop-types';
import { IconClose } from '../../../components/Icons';

const TopMessage = ({ className, message, hideMessage }) => {
  const classList = ['top-message padding-normal'];

  if (className) {
    classList.push(className);
  }

  return (
    <div className={classList.join(' ')} data-test-id="cashback.common.top-message.container">
      <IconClose
        className="top-message__close-icon icon icon__normal"
        data-test-id="cashback.common.top-message.close-btn"
        onClick={() => hideMessage()}
      />
      <span className="text-line-height-base">{message}</span>
    </div>
  );
};

TopMessage.displayName = 'TopMessage';

TopMessage.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  hideMessage: PropTypes.func,
};

TopMessage.defaultProps = {
  className: '',
  message: '',
  hideMessage: () => {},
};

export default TopMessage;
