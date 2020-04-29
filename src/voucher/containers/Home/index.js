import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfoLogo,
  getBusinessName,
  getVoucherList,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
} from '../../redux/modules/app';

class Home extends Component {
  handleContinue = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_CONTACT,
      search: window.location.search,
    });
  };

  handleSelectVoucher = voucher => {
    this.props.appActions.selectVoucher(voucher);
  };

  render() {
    const { t, onlineStoreLogo, businessName, beepSiteUrl, voucherList, currencySymbol, selectedVoucher } = this.props;
    return (
      <div className="gift-card__page">
        <div className="gift-card__card">
          <h1 className="header__title font-weight-bolder gift-card__header text-center">Give the perfect gift</h1>
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
          <div className="gift-card__caption text-center">
            Find out more about <a href={beepSiteUrl}>{businessName} ></a>
          </div>
        </div>
        <div className="gift-card__amount">
          <h2 className="header__title font-weight-bolder text-center">
            Send a gift instantly in any amount you choose
          </h2>
          <ul className="flex flex-middle flex-space-between gift-card__amount-items">
            {voucherList.map(voucher => (
              <li
                className={`flex flex-space-between flex-column text-center gift-card__amount-item ${
                  voucher === selectedVoucher ? 'selected' : ''
                }`}
              >
                <span>{currencySymbol}</span>
                <span className="font-weight-bolder gift-card__amount-number">{voucher}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="gift-card__notes">
          <div className="gift-card__note">
            <h2 className="header__title">About this Gift Voucher</h2>
            <ul>
              <li>Validity period: 60 days from purchase date</li>
              <li>
                Gift voucher(s) can only be applied to purchases made on {businessName}'s online store at {beepSiteUrl}
              </li>
            </ul>
          </div>
          <div className="gift-card__note">
            <h2 className="header__title">Things you need to know</h2>
            <ul>
              <li>
                The gift voucher(s) purchased are digital only and will be will be emailed to you or any designated
                recipient upon successful purchase.
              </li>
              <li>
                The gift voucher(s) are only available for one-time use, and are valid for 60 days from purchase date.
              </li>
              <li>To utilize the gift voucher(s), please place your order at the partner’s beepit.com online store.</li>
              <li>
                Apply the gift voucher(s) voucher code to your order upon check out and the gift voucher(s)’s value will
                be deducted automatically
              </li>
              <li>
                If the value of your order exceeds the value of the gift voucher, the outstanding balance will be
                charged to your chosen payment method
              </li>
              <li>
                The gift voucher(s) value will be valid for 60 days from the date of purchase with no extension after
                expiry
              </li>
              <li>
                The gift voucher(s) are non-cancellable / non-refundable / non-exchangeable for cash upon purchase.
              </li>
              <li>Partner exclusions may apply.</li>
            </ul>
          </div>
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleContinue}
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
        onlineStoreLogo: getOnlineStoreInfoLogo(state),
        businessName: getBusinessName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        voucherList: getVoucherList(state),
        selectedVoucher: getSelectedVoucher(state),
        currencySymbol: getCurrencySymbol(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Home);
