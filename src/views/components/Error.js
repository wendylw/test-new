import React from 'react';
import { withRouter } from 'react-router-dom';

class Error extends React.Component {
  render() {
    const {
      message = 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
    } = this.props.location.state || {};

    return (
      <section className="table-ordering__prompt-page">
        <figure className="prompt-page__image-container text-center">
          <img src="/img/matching-error.jpg" alt="error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">Eep!</h2>
          <div className="prompt-page__paragraphs">
            <p>{message}</p>
          </div>
        </div>
      </section>
    );
  }
}


export default withRouter(Error);