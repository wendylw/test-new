import React, { Component } from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import ErrorPage from '../../../components/Error';

import { connect } from 'react-redux';
import { getPageError } from '../../../redux/modules/entities/error';
import config from '../../../config';
import Utils from '../../../utils/utils';
export class Error extends Component {
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

  render() {
    const { t, error } = this.props;
    const { message } = error || {};
    const errorMessage = Utils.getSessionVariable('errorMessage');
    const { title, description } = this.getCurrentErrorType(errorMessage || message);

    return (
      <ErrorPage title={title} description={description} data-heap-name="ordering.error-page.container">
        <footer className="footer footer__white flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            data-heap-name="common.error-page.back-btn"
            onClick={() => {
              Utils.removeSessionVariable('errorMessage');
              return (window.location.href = config.beepitComUrl);
            }}
          >
            {t('BackToHome')}
          </button>
        </footer>
      </ErrorPage>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      error: getPageError(state),
    }),
    dispatch => ({})
  )
)(Error);
