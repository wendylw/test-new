import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from '../../../components/Modal';
import './MessageModal.scss';

class MessageModal extends Component {
  handleClickOK = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    const { t, data } = this.props;
    const { message, description, buttonText } = data;

    return (
      <Modal data-test-id="ordering.common.message-modal.container" className="message-modal" show>
        <Modal.Body className="text-center">
          <h4 className="padding-small text-size-biggest text-weight-bolder">{message}</h4>
          <p className="modal__text  padding-top-bottom-small">{description}</p>
        </Modal.Body>
        <Modal.Footer className="padding-small">
          <button
            className="button button__fill button__block text-weight-bolder"
            data-test-id="ordering.common.message-modal.ok-btn"
            onClick={this.handleClickOK}
          >
            {buttonText || t('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

MessageModal.displayName = 'MessageModal';

MessageModal.propTypes = {
  onHide: PropTypes.func,
  data: PropTypes.shape({
    message: PropTypes.string,
    description: PropTypes.string,
    buttonText: PropTypes.string,
  }),
};

MessageModal.defaultProps = {
  onHide: PropTypes.func,
  data: {
    message: '',
    description: '',
    buttonText: '',
  },
};

export default withTranslation()(MessageModal);
