import React, { Component } from 'react';
import Constants from '../../../utils/constants';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  actions as appActionCreators,
  getOnlineStoreInfoLogo,
  getOnlineStoreName,
  getVoucherList,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
  getVoucherValidityPeriodDays,
  getBusinessDisplayName,
} from '../../redux/modules/app';
import { updateVoucherOrderingInfoToSessionStorage } from '../../utils';
import VoucherAboutContent from '../../components/VoucherAboutContent';

class Home extends Component {
  componentDidMount() {
    this.props.appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    updateVoucherOrderingInfoToSessionStorage({
      selectedVoucher: this.props.selectedVoucher,
    });

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_CONTACT,
      search: window.location.search,
    });
  };

  handleSelectVoucher = voucher => {
    this.props.appActions.selectVoucher(voucher);
  };

  render() {
    const {
      t,
      onlineStoreLogo,
      onlineStoreName,
      beepSiteUrl,
      voucherList,
      currencySymbol,
      selectedVoucher,
      validityPeriodDays,
      businessDisplayName,
    } = this.props;

    const storeName = onlineStoreName || businessDisplayName;

    return (
      <div className="gift-card__page" data-heap-name="voucher.home.container">
        <div className="gift-card__card">
          <h1 className="font-weight-bolder gift-card__header text-center">{t('GiveThePerfectGift')}</h1>
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
          <div className="gift-card__caption text-center">
            {t('GiftCardFindOutMore')}
            <a href={beepSiteUrl}>{storeName} &gt;</a>
          </div>
        </div>
        <div className="gift-card__amount">
          <h2 className="gift-card__amount-title">{t('GiftCardChooseAmount')}</h2>
          <ul className="flex flex-middle flex-space-between gift-card__amount-items">
            {voucherList.map(voucher => (
              <li
                key={voucher}
                className={`flex flex-space-between flex-column text-center gift-card__amount-item ${
                  voucher === selectedVoucher ? 'selected' : ''
                }`}
                data-heap-name="voucher.home.voucher-item"
                onClick={() => {
                  this.handleSelectVoucher(voucher);
                }}
              >
                <span>{currencySymbol}</span>
                <span className="font-weight-bolder gift-card__amount-number">{voucher}</span>
              </li>
            ))}
          </ul>
        </div>
        <VoucherAboutContent onlineStoreName={storeName} validityPeriodDays={validityPeriodDays} />
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleContinue}
              disabled={!selectedVoucher}
              data-heap-name="voucher.home.continue-btn"
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
        onlineStoreName: getOnlineStoreName(state),
        businessDisplayName: getBusinessDisplayName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        voucherList: getVoucherList(state),
        selectedVoucher: getSelectedVoucher(state),
        currencySymbol: getCurrencySymbol(state),
        validityPeriodDays: getVoucherValidityPeriodDays(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Home);
