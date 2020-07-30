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
import Image from '../../../components/Image';
import VoucherAboutContent from '../../components/VoucherAboutContent';
import './VoucherHome.scss';

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
      <section className="voucher-home flex flex-column" data-heap-name="voucher.home.container">
        <div className="voucher-home__container">
          <div className="">
            <h1 className="text-center text-size-huge text-weight-bolder">{t('GiveThePerfectGift')}</h1>
            <div className="gift-card">
              {onlineStoreLogo ? (
                <Image
                  className="gift-card__logo logo logo__normal margin-top-bottom-smaller margin-left-right-normal"
                  src={onlineStoreLogo}
                  alt={`${storeName} Logo`}
                />
              ) : null}
              {selectedVoucher ? (
                <span className="gift-card__price margin-normal text-size-huge text-weight-bolder">
                  {currencySymbol}
                  {selectedVoucher}
                </span>
              ) : null}

              <span className="gift-card__name margin-normal text-omit__multiple-line">{storeName}</span>
            </div>

            <p className="voucher-home__prompt margin-normal text-center">
              <span className="voucher-home__prompt-text">{t('GiftCardFindOutMore')}</span>
              <a
                className="voucher-home__button-prompt-link button button__link padding-top-bottom-normal margin-left-right-smallest text-weight-bolder"
                href={beepSiteUrl}
              >
                {storeName} &gt;
              </a>
            </p>
          </div>
          <div className="padding-normal">
            <h2 className="text-center text-size-big text-weight-bolder">{t('GiftCardChooseAmount')}</h2>
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
                  <button>
                    <span>{currencySymbol}</span>
                    <span className="text-weight-bolder gift-card__amount-number">{voucher}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <VoucherAboutContent onlineStoreName={storeName} validityPeriodDays={validityPeriodDays} />
        </div>
        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smallest text-weight-bolder text-uppercase"
            onClick={this.handleContinue}
            disabled={!selectedVoucher}
            data-heap-name="voucher.home.continue-btn"
          >
            {t('Continue')}
          </button>
        </footer>
      </section>
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
