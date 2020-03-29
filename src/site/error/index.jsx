import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import beepWarningImage from '../../images/beep-warning.png';

class Error extends Component {
  getErrorContent() {
    const { t, location, match } = this.props;
    const { isIOS } = location.state || {};
    const { type } = match.params || {};
    const errorList = {
      scanNotSupport: {
        logo: beepWarningImage,
        title: t('UnsupportedBrowser'),
        description: isIOS ? (
          <Trans ns="Scanner" i18nKey="IosSorryText">
            <p className="text-size-big">
              Please open beepit.co in <span className="text-weight-bold text-size-big">Safari.</span>
            </p>
          </Trans>
        ) : (
          <Trans ns="Scanner" i18nKey="AndroidSorryText">
            <p className="text-size-big">
              Please open beepit.co in <span className="text-weight-bold text-size-big">Google Chrome</span>.
            </p>
          </Trans>
        ),
      },
    };

    return errorList[type] || {};
  }

  render() {
    const error = this.getErrorContent();

    return (
      <main className="prompt-page fixed-wrapper">
        <figure className="prompt-page__image-container text-center">
          <img src={error.logo} alt="error found" />
        </figure>

        <div className="prompt-page__content">
          <h2 className="prompt-page__title text-center text-size-huge">{error.title}</h2>
          <div className="prompt-page__paragraphs text-center">{error.description}</div>
        </div>
      </main>
    );
  }
}

export default withTranslation()(Error);
