import React from 'react';
import PropTypes from 'prop-types';
import { IconClose } from '../../../components/Icons';
import './TopMessage.scss';

class TopMessage extends React.Component {
  state = {};

  render() {
    const { className, message, hideMessage } = this.props;
    const classList = ['top-message'];

    if (className) {
      classList.push(className);
    }

    return (
      <div className={classList.join(' ')} data-heap-name="cashback.common.top-message.container">
        <IconClose
          className="top-message__close-icon icon icon__normal"
          data-heap-name="cashback.common.top-message.close-btn"
          onClick={() => hideMessage()}
        />
        <span className="text-line-height-base">{message}</span>
      </div>
    );
  }
}

TopMessage.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  hideMessage: PropTypes.func,
};

TopMessage.defaultTypes = {
  message: '',
  hideMessage: () => {},
};

export default TopMessage;
