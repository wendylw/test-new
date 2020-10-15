import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Modal from '../../../components/Modal';
import './MessageModal.scss';
class MessageModal extends Component {
  handleClickOK = () => {
    this.props.onHide();
  };

  render() {
    const { t, data } = this.props;
    const { message, description, buttonText, show } = data;

    return (
      <Modal data-heap-name="ordering.common.message-modal.container" className="offline-store-modal" show={true}>
        <Modal.Body className={'offline-store-modal__body text-center'}>
          <h4 className="padding-small text-size-biggest text-weight-bolder">{message}</h4>
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
      // <section className="messageModal__wrapper">
      //   <div className="messageModal__content">
      //     <header className="messageModal__header ">{message}</header>
      //     <div className="messageModal__body">
      //       <p className="messageModal__text">{description}</p>
      //     </div>
      //     <footer>
      //       <button className="button__fill button__block font-weight-bolder" onClick={this.handleClickOK}>
      //         {buttonText || t('OK')}
      //       </button>
      //     </footer>
      //   </div>
      // </section>
    );
  }
}

export default withTranslation()(MessageModal);
