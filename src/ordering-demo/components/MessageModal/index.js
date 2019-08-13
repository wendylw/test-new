import React, { Component } from 'react';

class MessageModal extends Component {
  render() {
    const { message, description } = this.props.data;

    return (
      <section
        className="emodal__align-middle modal flex flex-middle flex-space-betwen"
        style={styles.section}
      >
        <div className="modal__content">
          <header className="hint-modal__header modal__header">
            {/* <h4 className="font-weight-bold">Payment Cancelled</h4> */}
            <h4 className="font-weight-bold">{message}</h4>
          </header>
          <div className="modal__body">
            <div className="modal__paragraph-container">
              {/* <p className="modal__paragraph">You have cancelled your payment. The contents of your cart have been saved for you.</p> */}
              <p className="modal__paragraph">{description}</p>
            </div>
          </div>
          <footer>
            <button className="button__fill button__block" onClick={this.handleClickOK}>OK</button>
          </footer>
        </div>
      </section>
    );
  }

  handleClickOK = () => {
    this.props.onHide();
  }
}

const styles = {
  section: {
    display: 'block',
  }
};

export default MessageModal;
