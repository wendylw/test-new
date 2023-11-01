import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, withTranslation } from 'react-i18next';
import { IconLeftArrow } from '../../components/Icons';
import prefetch from '../../common/utils/prefetch-assets';
import beepWarningImage from '../../images/beep-warning.png';
import './index.scss';

class Error extends Component {
  componentDidMount() {
    prefetch(['SITE_HM'], ['SiteHome']);
  }

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
              Please open beepit.co in <span className="text-weight-bolder text-size-big">Safari.</span>
            </p>
          </Trans>
        ) : (
          <Trans ns="Scanner" i18nKey="AndroidSorryText">
            <p className="text-size-big">
              Please open beepit.co in <span className="text-weight-bolder text-size-big">Google Chrome</span>.
            </p>
          </Trans>
        ),
      },
    };

    return errorList[type] || {};
  }

  backToPreviousPage = data => {
    const { history, location } = this.props;
    const pathname = (location.state && location.state.from && location.state.from.pathname) || '/home';

    history.push({
      pathname,
      state: {
        from: location,
        data,
      },
    });
  };

  handleBackClicked = () => {
    this.backToPreviousPage();
  };

  render() {
    const { t } = this.props;
    const error = this.getErrorContent();

    return (
      <main className="fixed-wrapper fixed-wrapper__main" data-test-id="site.error.container">
        <header className="header flex flex-space-between flex-middle sticky-wrapper">
          <div>
            <IconLeftArrow
              className="icon icon__big icon__default text-middle"
              onClick={this.handleBackClicked}
              data-test-id="site.error.back-btn"
            />
            <h2 className="header__title text-middle text-size-big text-weight-bolder text-omit__single-line">
              {t('ScanQRCode')}
            </h2>
          </div>
        </header>
        <section className="prompt-page">
          <figure className="prompt-page__image-container text-center">
            <img src={error.logo} alt="error found" />
          </figure>

          <div className="prompt-page__content">
            <h2 className="prompt-page__title text-center text-size-huge">{error.title}</h2>
            <div className="prompt-page__paragraphs text-center">{error.description}</div>
          </div>
        </section>
      </main>
    );
  }
}

Error.displayName = 'SiteError';

Error.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      urlPath: PropTypes.string,
    }),
  }),
  location: PropTypes.shape({
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object,
  }),
};

Error.defaultProps = {
  match: {
    params: {
      urlPath: '',
    },
  },
  location: {
    state: null,
  },
};

export default withTranslation(['Scanner'])(Error);
