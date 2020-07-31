import React, { Component } from 'react';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from '../../../components/Header';
import Constants from '../../../utils/constants';

import {
  actions as appActionCreators,
  getOnlineStoreInfoLogo,
  getOnlineStoreName,
  getBeepSiteUrl,
  getOrderContactEmail,
  getOrderVoucherCode,
  getVoucherValidityPeriodDays,
} from '../../redux/modules/app';
import giftCardImage from '../../../images/thankyou-giftcard.svg';
import VoucherIntroduction from '../../components/VoucherIntroduction';

class ThankYou extends Component {
  componentDidMount() {
    const receiptNumber = Utils.getQueryString('receiptNumber');
    this.props.appActions.loadOrder(receiptNumber);
  }
  handlerClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_HOME,
    });
  };

  render() {
    const {
      t,
      beepSiteUrl,
      onlineStoreLogo,
      contactEmail,
      voucherCode,
      onlineStoreName,
      validityPeriodDays,
    } = this.props;
    return (
      <section className="thankyou-page" data-heap-name="voucher.thank-you.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="voucher.thank-you.header"
          isPage={true}
          navFunc={this.handleClickBack}
        />
        <h1 className="thankyou-page__title">{t('ThankYou')}!</h1>
        <div className="thankyou-page__gifCard">
          <img alt="Gift Card" src={giftCardImage} />
        </div>
        <div className="thankyou-page__contact-info">
          {t('VoucherHaveBeenSentTo')}
          <span className="contact-info__email">{contactEmail}</span>
        </div>
        <div className="thankyou-page__order-info">
          <div className="voucher-code__container">
            <p className="voucher-code__title">{t('YourGiftVoucherCode')}</p>
            <p className="voucher-code__content">{voucherCode}</p>
          </div>
          <div className="store-info__container">
            {onlineStoreLogo ? (
              <p className="store-info__logo">
                <img alt={`${onlineStoreName} Logo`} src={onlineStoreLogo} />
              </p>
            ) : null}

            <p className="store-info__site">
              <a href={beepSiteUrl} data-heap-name="voucher.thank-you.visit-site-link">
                {t('VisitSiteToUseVoucherNow', { onlineStoreName })}
              </a>
            </p>
          </div>
        </div>
        <VoucherIntroduction onlineStoreName={onlineStoreName} validityPeriodDays={validityPeriodDays} />
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
        beepSiteUrl: getBeepSiteUrl(state),
        contactEmail: getOrderContactEmail(state),
        voucherCode: getOrderVoucherCode(state),
        validityPeriodDays: getVoucherValidityPeriodDays(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(ThankYou);
