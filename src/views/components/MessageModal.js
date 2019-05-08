import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class MessageModal extends Component {
  componentDidMount() {
    this.keepRouteSafe();
  }

  keepRouteSafe() {
    const error = this.errorState();

    if (!error) {
      this.hide();
    }
  }

  hide() {
    const { history } = this.props;
    history.replace({
      ...history.location,
      search: (history.location.search || '').replace('modal=message', '')
    });
  }

  errorState() {
    const { history } = this.props;
    return history.location.search.includes('modal=message') && (history.location.state || {}).error;
  }

  render() {
    const style = {};
    const error = this.errorState();

    if (!error) {
      return null;
    }

    style.display = 'block';

    return (
      <section className="emodal__align-middle modal flex flex-middle flex-space-betwen" style={style}>
        <div className="modal__content">
          <header className="hint-modal__header modal__header">
            {/* <h4 className="font-weight-bold">Payment Cancelled</h4> */}
            <h4 className="font-weight-bold">{error.message}</h4>
          </header>
          <div className="modal__body">
            <div className="modal__paragraph-container">
              {/* <p className="modal__paragraph">You have cancelled your payment. The contents of your cart have been saved for you.</p> */}
              <p className="modal__paragraph">{error.description}</p>
            </div>
          </div>
          <footer>
            <button className="button__fill button__block" onClick={() => this.hide()}>OK</button>
          </footer>
        </div>
      </section>
    );
  }
}

export default withRouter(MessageModal);
