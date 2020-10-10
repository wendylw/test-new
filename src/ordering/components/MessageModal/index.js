import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Modal from '../../components/MessageModal';

class MessageModal extends Component {
  handleClickOK = () => {
    this.props.onHide();
  };

  render() {
    const { t, data } = this.props;
    const { message, description, buttonText } = data;

    return (
      <Modal data-heap-name="ordering.common.message-modal.container">
        <Modal.Body>
          <h4 className="text-weight-bolder">{message}</h4>
          <p className="modal__text">{description}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="button button__fill button__block text-weight-bolder"
            data-heap-name="ordering.common.message-modal.ok-btn"
            onClick={this.handleClickOK}
          >
            {buttonText || t('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default withTranslation()(MessageModal);
