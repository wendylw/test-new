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
  getBusinessDisplayName,
  getVoucherList,
  getBeepSiteUrl,
  getSelectedVoucher,
  getCurrencySymbol,
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
      businessDisplayName,
      beepSiteUrl,
      voucherList,
      currencySymbol,
      selectedVoucher,
    } = this.props;
    return (
      <div className="gift-card__page">
        <div className="gift-card__card">
          <h1 className="font-weight-bolder gift-card__header text-center">{t('GiveThePerfectGift')}</h1>
          <div className="gift-card__card-container">
            <div className="gift-card__store">
              <div className="gift-card__store-item gift-card__store-logo">
                {onlineStoreLogo ? <img alt="store-logo" src={onlineStoreLogo} /> : null}
              </div>
              {selectedVoucher ? (
                <div className="gift-card__store-item gift-card__store-amount">
                  {currencySymbol}
                  {selectedVoucher}
                </div>
              ) : null}
              <div className="gift-card__store-item gift-card__store-name">{businessDisplayName}</div>
            </div>
          </div>
          <div className="gift-card__caption text-center">
            {t('GiftCardFindOutMore')}
            <a href={beepSiteUrl}>{businessDisplayName} ></a>
          </div>
        </div>
        <div className="gift-card__amount">
          <h2 className="gift-card__amount-title">{t('GiftCardChooseAmount')}</h2>
          <ul className="flex flex-middle flex-space-between gift-card__amount-items">
            {voucherList.map(voucher => (
              <li
                className={`flex flex-space-between flex-column text-center gift-card__amount-item ${
                  voucher === selectedVoucher ? 'selected' : ''
                }`}
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
        <VoucherAboutContent businessDisplayName={businessDisplayName} periodDays={60} />
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-1">
            <button
              className="continue__button button button__fill button__block font-weight-bolder"
              onClick={this.handleContinue}
              disabled={!selectedVoucher}
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
        businessDisplayName: getBusinessDisplayName(state),
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
