import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import config from '../config';
import beepErrorImage from '../images/beep-error.png';
import Utils from '../utils/utils';

export class ErrorPage extends PureComponent {
  getCurrentErrorType(type) {
    if (!type) {
      return {};
    }

    const { t } = this.props;

    const Errors = {
      NoBusiness: {
        title: `${t('NoBusinessTitle')}!`,
        description: t('NoBusinessDescription'),
      },
      QROrderingDisabled: {
        title: `${t('Sorry')}!`,
        description: t('QROrderingDisabledDescription'),
      },
    };

    return Errors[type.replace(/\s/g, '')] || {};
  }

  render() {
    const { t, error } = this.props;
    const { message } = error || {};
    const { title, description } = this.getCurrentErrorType(message);
    const isWebView = Utils.isWebview();
    return (
      <section className="table-ordering__prompt-page" data-heap-name="common.error-page.container">
        <figure className="prompt-page__image-container text-center">
          <img src={beepErrorImage} alt="error found" />
        </figure>
        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center">{title}</h2>
          <div className="prompt-page__paragraphs text-center">
            <p>{description}</p>
          </div>
        </div>

        <div className="prompt-page__button-container">
          <button
            className="button button__block button__fill font-weight-bolder text-center text-uppercase border-radius-base"
            data-heap-name="common.error-page.back-btn"
            onClick={() => {
              if (isWebView) {
                if (Utils.isAndroidWebview()) {
                  window.androidInterface.gotoHome();
                } else if (Utils.isIOSWebview()) {
                  window.webkit.messageHandlers.shareAction.postMessage('gotoHome');
                }
              } else {
                window.location.href = config.qrScanPageUrl;
                return;
              }
            }}
          >
            {t('BackToHome')}
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

export default withTranslation()(ErrorPage);
