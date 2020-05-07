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
  getOnlineStoreName,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
  getBusinessDisplayName,
} from '../../redux/modules/app';
import { updateVoucherOrderingInfoToSessionStorage } from '../../utils';
import Utils from '../../../utils/utils';

class Contact extends Component {
  state = {
    invalidEmail: false,
  };

  componentDidMount() {
    this.props.appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    if (!Utils.checkEmailIsValid(this.props.contactEmail)) {
      this.setState({
        invalidEmail: true,
      });
      return;
    }

    updateVoucherOrderingInfoToSessionStorage({
      contactEmail: this.props.contactEmail,
    });

    this.gotoPaymentPage();
  };

  gotoPaymentPage = () => {
    window.location.href = Constants.ROUTER_PATHS.VOUCHER_PAYMENT + '?type=' + Constants.DELIVERY_METHOD.DIGITAL;
  };

  handleEmailChange = e => {
    const email = e.target.value.trim();
    this.props.appActions.updateContactEmail(email);

    this.setState({
      invalidEmail: false,
    });
  };

  handleClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_HOME,
      search: window.location.search,
    });
  };

  render() {
    const {
      t,
      contactEmail,
      onlineStoreLogo,
      onlineStoreName,
      businessDisplayName,
      currencySymbol,
      selectedVoucher,
    } = this.props;
    const { invalidEmail } = this.state;
    const invalidEmailClass = invalidEmail ? 'input__error' : '';
    const storeName = onlineStoreName || businessDisplayName;

    return (
      <div className="update-contact__page">
        <Header clickBack={this.handleClickBack} />
        <div className="gift-card__page">
          <div className="gift-card__card">
            <h2 className="font-weight-bolder text-center gift-card__subtitle">{t('GiftCardSelected')}</h2>
            <div className="gift-card__card-container">
              <div className="gift-card__store">
                <div className="gift-card__store-item gift-card__store-logo">
                  {onlineStoreLogo ? <img alt={`${storeName} Logo`} src={onlineStoreLogo} /> : null}
                </div>
                {selectedVoucher ? (
                  <div className="gift-card__store-item gift-card__store-amount">
                    {currencySymbol}
                    {selectedVoucher}
                  </div>
                ) : null}
                <div className="gift-card__store-item gift-card__store-name">{storeName}</div>
              </div>
            </div>
          </div>
          <div className="gift-card__email">
            <h2 className="gift-card__email-title">{t('SendGiftCardTo')}</h2>
            <div className="gift-card__email-note">{t('GiftCardEmailNote')}</div>
            <input
              className={`gift-card__email-input input input__block ${invalidEmailClass}`}
              onChange={this.handleEmailChange}
              value={contactEmail}
            />
            {invalidEmail ? <div className="input__error-message">{t('InvalidEmail')}</div> : null}
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
        onlineStoreName: getOnlineStoreName(state),
        businessDisplayName: getBusinessDisplayName(state),
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
