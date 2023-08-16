import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
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
import VoucherIntroduction from '../../components/VoucherIntroduction';
import VoucherGiftCard from '../../components/VoucherGiftCard';
import Constants from '../../../utils/constants';
import './VoucherHome.scss';

class Home extends Component {
  componentDidMount() {
    const { appActions } = this.props;

    appActions.initialVoucherOrderingInfo();
  }

  handleContinue = () => {
    const { selectedVoucher, history } = this.props;

    updateVoucherOrderingInfoToSessionStorage({
      selectedVoucher,
    });

    history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_CONTACT,
      search: window.location.search,
    });
  };

  handleSelectVoucher = voucher => {
    const { appActions } = this.props;

    appActions.selectVoucher(voucher);
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
    const { id: selectedVoucherId, unitPrice } = selectedVoucher || {};

    return (
      <section className="voucher-home flex flex-column" data-test-id="voucher.home.container">
        <div className="voucher-home__container">
          <div>
            <h1 className="text-center text-size-huge text-weight-bolder">{t('GiveThePerfectGift')}</h1>
            <VoucherGiftCard
              onlineStoreLogo={onlineStoreLogo}
              storeName={storeName}
              currencySymbol={currencySymbol}
              selectedVoucher={unitPrice || null}
            />

            <p className="voucher-home__prompt margin-normal text-center">
              <span className="voucher-home__prompt-text">{t('GiftCardFindOutMore')}</span>
              <a
                className="voucher-home__button-prompt-link button button__link padding-top-bottom-normal margin-left-right-smaller text-weight-bolder"
                href={beepSiteUrl}
              >
                {storeName} &gt;
              </a>
            </p>
          </div>
          <div>
            <h2 className="text-center padding-normal text-size-big text-weight-bolder">{t('GiftCardChooseAmount')}</h2>
            <ul className="flex flex-middle flex-space-between padding-normal margin-top-bottom-small">
              {(voucherList || []).map(voucher => (
                <li className="voucher-home__item-price padding-left-right-small" key={voucher.id}>
                  <button
                    className={`voucher-home__button-price button ${
                      selectedVoucher && selectedVoucherId === voucher.id ? 'button__fill' : 'button__outline'
                    } padding-top-bottom-smaller padding-left-right-normal`}
                    data-test-id="voucher.home.voucher-item"
                    onClick={() => {
                      this.handleSelectVoucher(voucher);
                    }}
                  >
                    <span>{currencySymbol}</span>
                    <span className="voucher-home__price-number text-size-big text-weight-bolder">
                      {voucher.unitPrice}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <VoucherIntroduction onlineStoreName={storeName} validityPeriodDays={validityPeriodDays} />
        </div>
        <footer className="footer flex__shrink-fixed padding-top-bottom-small padding-left-right-normal">
          <button
            className="button button__block button__fill padding-normal margin-top-bottom-smaller text-weight-bolder text-uppercase"
            onClick={this.handleContinue}
            disabled={!selectedVoucher}
            data-test-id="voucher.home.continue-btn"
          >
            {t('Continue')}
          </button>
        </footer>
      </section>
    );
  }
}

Home.displayName = 'VoucherHome';

Home.propTypes = {
  appActions: PropTypes.shape({
    selectVoucher: PropTypes.func,
    initialVoucherOrderingInfo: PropTypes.func,
  }),
  selectedVoucher: PropTypes.shape({
    id: PropTypes.string,
    unitPrice: PropTypes.number,
  }),
  voucherList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      unitPrice: PropTypes.number,
    })
  ),
  validityPeriodDays: PropTypes.number,
  beepSiteUrl: PropTypes.string,
  onlineStoreLogo: PropTypes.string,
  onlineStoreName: PropTypes.string,
  currencySymbol: PropTypes.string,
  businessDisplayName: PropTypes.string,
};

Home.defaultProps = {
  appActions: {
    selectVoucher: () => {},
    initialVoucherOrderingInfo: () => {},
  },
  selectedVoucher: null,
  voucherList: [],
  beepSiteUrl: '',
  onlineStoreLogo: '',
  onlineStoreName: '',
  currencySymbol: '',
  validityPeriodDays: 0,
  businessDisplayName: '',
};

export default compose(
  withTranslation(['Voucher']),
  connect(
    state => ({
      onlineStoreLogo: getOnlineStoreInfoLogo(state),
      onlineStoreName: getOnlineStoreName(state),
      businessDisplayName: getBusinessDisplayName(state),
      beepSiteUrl: getBeepSiteUrl(state),
      voucherList: getVoucherList(state),
      selectedVoucher: getSelectedVoucher(state),
      currencySymbol: getCurrencySymbol(state),
      validityPeriodDays: getVoucherValidityPeriodDays(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Home);
