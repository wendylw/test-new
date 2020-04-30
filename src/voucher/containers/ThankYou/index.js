import React, { Component } from 'react';
import { compose } from 'redux';
import Utils from '../../../utils/utils';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from '../../components/Header';
import Constants from '../../../utils/constants';

import {
  actions as appActionCreators,
  getOnlineStoreInfoLogo,
  getBusinessDisplayName,
  getBeepSiteUrl,
  getOrderContactEmail,
  getOrderVoucherCode,
} from '../../redux/modules/app';
import giftCardImage from '../../../images/thankyou-giftcard.svg';
class ThankYou extends Component {
  componentDidMount() {
    const receiptNumber = Utils.getQueryString('receiptNumber');
    this.props.appActions.loadOrder(receiptNumber);
  }
  handlerClickBack = () => {
    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.VOUCHER_HOME,
      search: window.location.search,
    });
  };

  render() {
    const { t, beepSiteUrl, onlineStoreLogo, contactEmail, voucherCode, businessDisplayName } = this.props;
    return (
      <section className="thankyou-page">
        <Header clickBack={this.handlerClickBack} />
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
            <p className="store-info__logo">
              {onlineStoreLogo ? <img alt={businessDisplayName} src={onlineStoreLogo} /> : null}
            </p>
            <p className="store-info__site">
              <a href={beepSiteUrl}>{t('VisitSiteToUseVoucherNow', { businessDisplayName })}</a>
            </p>
          </div>
        </div>
        <div className="gift-card__notes"></div>
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
        businessDisplayName: getBusinessDisplayName(state),
        beepSiteUrl: getBeepSiteUrl(state),
        contactEmail: getOrderContactEmail(state),
        voucherCode: getOrderVoucherCode(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(ThankYou);
