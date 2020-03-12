import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import config from '../config';
import beepErrorImage from '../images/beep-error.png';

export class ErrorPage extends PureComponent {
  render() {
    const { t } = this.props;

    return (
      <main className="table-ordering">
        <section className="table-ordering__prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src={beepErrorImage} alt="error found" />
          </figure>
          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center">504</h2>
          </div>

          <div className="prompt-page__button-container">
            <button
              className="button button__block button__fill font-weight-bold text-center text-uppercase border-radius-base"
              onClick={() => {
                return (window.location.href = config.qrScanPageUrl);
              }}
            >
              {t('BackToHome')}
            </button>
          </div>
        </section>
      </main>
    );
  }
}

ErrorPage.propTypes = {
  error: PropTypes.object,
};

ErrorPage.defaultProps = {
  error: {},
};

export default withTranslation()(ErrorPage);
