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
import './VoucherThanks.scss';

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
      <section className="voucher-thanks flex flex-column" data-heap-name="voucher.thank-you.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="voucher.thank-you.header"
          isPage={true}
          navFunc={this.handleClickBack}
        />

        <div className="voucher-thanks__container">
          <h2 className="voucher-thanks__title text-center padding-normal margin-top-bottom-smaller text-size-large text-weight-light">
            {t('ThankYou')}!
          </h2>
          <div className="text-center padding-left-right-normal">
            <img className="voucher-thanks__image" alt="Gift Card" src={giftCardImage} />
          </div>

          <div className="text-center padding-normal margin-normal">
            <span className="text-size-big">{t('VoucherHaveBeenSentTo')}</span>
            <span className="text-size-big text-weight-bolder">{contactEmail}</span>
          </div>

          <div className="card">
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
        </div>
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
