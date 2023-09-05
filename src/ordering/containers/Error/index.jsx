import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import prefetch from '../../../common/utils/prefetch-assets';
import ErrorPage from '../../../components/Error';
import { getPageError } from '../../../redux/modules/entities/error';
import config from '../../../config';
import Utils from '../../../utils/utils';
import * as NativeMethods from '../../../utils/native-methods';
import NativeHeader from '../../../components/NativeHeader';

export class Error extends Component {
  componentDidMount() {
    prefetch(['SITE_HM'], ['SiteHome']);
  }

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
      NoDeliveryLocation: {
        title: `${t('Sorry')}!`,
        description: t('NoDeliveryLocationDescription'),
      },
    };

    return Errors[type.replace(/\s/g, '')] || {};
  }

  handleGoBack = () => {
    Utils.removeSessionVariable('errorMessage');

    if (Utils.isWebview()) {
      NativeMethods.gotoHome();
    } else {
      window.location.href = config.beepitComUrl;
    }
  };

  render() {
    const { t, error } = this.props;
    const { message } = error || {};
    const errorMessage = Utils.getSessionVariable('errorMessage');
    const { title, description } = this.getCurrentErrorType(errorMessage || message);

    return (
      <>
        {Utils.isWebview() && <NativeHeader />}
        <ErrorPage title={title} description={description} data-test-id="ordering.error-page.container">
          <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
            <button
              className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
              data-test-id="common.error-page.back-btn"
              onClick={this.handleGoBack}
            >
              {t('BackToHome')}
            </button>
          </footer>
        </ErrorPage>
      </>
    );
  }
}

Error.displayName = 'Error';

Error.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

Error.defaultProps = {
  error: {
    message: '',
  },
};

export default compose(
  withTranslation(),
  connect(state => ({
    error: getPageError(state),
  }))
)(Error);
