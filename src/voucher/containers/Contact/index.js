import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import Header from '../../components/Header';

import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getContactEmail,
  getOnlineStoreInfoLogo,
  getBusinessName,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
} from '../../redux/modules/app';
import { updateVoucherOrderingInfoToSessionStore } from '../../utils';

class Contact extends Component {
  componentDidMount() {
    this.props.appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    updateVoucherOrderingInfoToSessionStore({
      contactEmail: this.props.contactEmail,
    });
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_PAYMENT,
      search: `${window.location.search}&type=${Constants.DELIVERY_METHOD.DIGITAL}`,
    });
  };

  handleEmailChange = e => {
    const email = e.target.value;
    this.props.appActions.updateContactEmail(email);
  };

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_HOME,
      search: window.location.search,
    });
  };

  render() {
    const { t, contactEmail, onlineStoreLogo, businessName, beepSiteUrl, currencySymbol, selectedVoucher } = this.props;
    return (
      <div className="update-contact__page">
        <Header clickBack={this.handleClickBack} />
        <div className="gift-card__page">
          <div className="gift-card__card">
            <h2 className="header__title font-weight-bolder text-center gift-card__subtitle">
              {t('GiftCardSelected')}
            </h2>
            <div className="gift-card__card-container">
              <div className="gift-card__store">
                <div className="gift-card__store-item gift-card__store-logo">
                  <img alt="store-logo" src={onlineStoreLogo} />
                </div>
                {selectedVoucher ? (
                  <div className="gift-card__store-item gift-card__store-amount">
                    {currencySymbol}
                    {selectedVoucher}
                  </div>
                ) : null}
                <div className="gift-card__store-item gift-card__store-name">{businessName}</div>
              </div>
            </div>
          </div>
          <div className="gift-card__email">
            <h2 className="header__title font-weight-bolder gift-card__email-title">{'SendGiftCardTo'}</h2>
            <h2 className="gift-card__email-note">{t('GiftCardEmailNote')}</h2>
            <input className="gift-card__email-input" onChange={this.handleEmailChange} value={contactEmail} />
          </div>
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleContinue}
              disabled={!contactEmail}
            >
              {t('CONTINUE')}
            </button>
          </div>
        </footer>
      </div>
    );
  }
}

export default compose(
  withTranslation(['Voucher']),
  connect(
    state => {
      return {
        contactEmail: getContactEmail(state),
        onlineStoreLogo: getOnlineStoreInfoLogo(state),
        businessName: getBusinessName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        selectedVoucher: getSelectedVoucher(state),
        currencySymbol: getCurrencySymbol(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Contact);
