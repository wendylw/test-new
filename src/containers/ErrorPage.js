import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from '../config';

export class ErrorPage extends Component {
  getCurrentErrorType(type) {
    if (!type) {
      return '';
    }

    const Errors = {
      NoBusiness: {
        title: 'Store Not Found',
        description: 'This store does not exist, please check your store name and try again.',
      },
      QROrderingDisabled: {
        title: 'Sorry',
        description: 'Oops, seems like this store no longer supports QR Ordering.',
      },
    };

    return Errors[type.replace(/\s/g, '')] || {};
  }

  render() {
    const { error } = this.props;
    const { message } = error || {};
    const { title, description } = this.getCurrentErrorType(message) || {};

    return (
      <section className="table-ordering__prompt-page">
        <figure className="prompt-page__image-container text-center">
          <img src="/img/beep-error.png" alt="error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">{title}</h2>
          <div className="prompt-page__paragraphs text-center">
            <p>{description}</p>
          </div>
        </div>

        <div className="prompt-page__button-container">
          <button
            className="button button__block button__fill font-weight-bold text-center text-uppercase border-radius-base"
            onClick={() => {
              return (window.location.href = config.qrScanPageUrl);
            }}
          >
            Back to home
          </button>
        </div>
      </section>
    );
  }
}

ErrorPage.propTypes = {
  error: PropTypes.object,
};

ErrorPage.defaultProps = {
  error: {},
};

export default ErrorPage;
