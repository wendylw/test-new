import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class MessageModal extends Component {
  handleClickOK = () => {
    this.props.onHide();
  };

  render() {
    const { t, data } = this.props;
    const { message, description, buttonText } = data;

    return (
      <section
        className="modal__align-middle modal flex flex-middle flex-space-between"
        style={styles.section}
        data-heap-name="ordering.common.message-modal.container"
      >
        <div className="modal__content">
          <header className="hint-modal__header modal__header">
            <h4 className="font-weight-bolder">{message}</h4>
          </header>
          <div className="modal__body">
            <p className="modal__text">{description}</p>
          </div>
          <footer>
            <button
              className="button__fill button__block font-weight-bolder"
              data-heap-name="ordering.common.message-modal.ok-btn"
              onClick={this.handleClickOK}
            >
              {buttonText || t('OK')}
            </button>
          </footer>
        </div>
      </section>
    );
  }
}

const styles = {
  section: {
    display: 'block',
  },
};

export default withTranslation()(MessageModal);
