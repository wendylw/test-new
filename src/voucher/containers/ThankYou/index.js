import React, { Component } from 'react';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from '../../../components/Header';
import Image from '../../../components/Image';
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
  handleClickBack = () => {
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
          <h2 className="voucher-thanks__title text-center padding-normal margin-top-bottom-small text-size-large text-weight-light">
            {t('ThankYou')}!
          </h2>
          <div className="text-center padding-left-right-normal">
            <img className="voucher-thanks__image" alt="Gift Card" src={giftCardImage} />
          </div>

          <div className="text-center padding-normal margin-normal">
            <span className="text-size-big">{t('VoucherHaveBeenSentTo')}</span>
            <span className="text-size-big text-weight-bolder">{contactEmail}</span>
          </div>

          <div className="card margin-normal">
            <div className="text-center padding-small border__bottom-divider">
              <h4 className="margin-small text-size-big text-weight-bolder">{t('YourGiftVoucherCode')}</h4>
              <span className="voucher-thanks__voucher-code padding-small text-size-huge text-weight-bolder">
                {voucherCode}
              </span>
            </div>
            <div className="padding-top-bottom-smaller">
              {onlineStoreLogo ? (
                <Image
                  className="voucher-thanks__logo logo logo__big margin-normal"
                  alt={`${onlineStoreName} Logo`}
                  src={onlineStoreLogo}
                />
              ) : null}

              <div className="text-center margin-normal">
                <a
                  class="voucher-thanks__button-link button button__link text-size-big text-weight-bolder"
                  href={beepSiteUrl}
                  data-heap-name="voucher.thank-you.visit-site-link"
                >
                  {t('VisitSiteToUseVoucherNow', { onlineStoreName })}
                </a>
              </div>
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
