import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';

import { actions as thankYouActionCreators, getOrder, getPromotion } from '../../redux/modules/thankYou';
import './OrderingDetails.scss';

export class OrderDetails extends Component {
  state = {};

  componentDidMount() {
    const { thankYouActions } = this.props;

    thankYouActions.loadOrder(this.getReceiptNumber());
  }

  getReceiptNumber = () => {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);

    return query.get('receiptNumber');
  };

  handleVisitMerchantInfoPage = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.MERCHANT_INFO,
      search: window.location.search,
    });
  };

  renderOrderDetails() {
    const { order } = this.props;
    const { items } = order || {};

    return (
      <ul className="">
        {(items || []).map((value, index) => {
          const { title, displayPrice, quantity, variationTexts } = value;

          return (
            <li key={`title-${index}`} className="flex flex-middle flex-space-between">
              <summary className="flex flex-top">
                <span className="padding-left-right-small flex__shrink-fixed text-opacity">{quantity} x</span>
                <div className="ordering-details__item-content padding-left-right-small">
                  <span className="ordering-details__item-title text-opacity">{title}</span>
                  <p>
                    {variationTexts[0] ? (
                      <span className="ordering-details__item-variations">{variationTexts.join(', ')}</span>
                    ) : null}
                  </p>
                </div>
              </summary>
              <CurrencyNumber
                className="padding-left-right-small flex__shrink-fixed text-opacity"
                money={displayPrice * quantity}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  renderPromotion() {
    const { promotion, t } = this.props;
    if (!promotion) {
      return null;
    }

    return (
      <li className="item flex flex-space-between flex-middle">
        <span className="text-opacity">
          {t(promotion.promoType)} ({promotion.promoCode})
        </span>
        <CurrencyNumber className="text-opacity" money={-promotion.discount} />
      </li>
    );
  }

  render() {
    const { order, history, t } = this.props;
    const { shippingFee, subtotal, total, tax, loyaltyDiscounts } = order || '';

    const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

    return (
      <section className="ordering-details flex flex-column" data-heap-name="ordering.order-detail.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          data-heap-name="ordering.order-detail.header"
          isPage={false}
          title={t('OrderDetails')}
          navFunc={() =>
            history.replace({
              pathname: Constants.ROUTER_PATHS.THANK_YOU,
              search: window.location.search,
            })
          }
        >
          <button
            className="ordering-details__button-contact-us button padding-top-bottom-smaller padding-left-right-normal flex__shrink-fixed text-uppercase"
            onClick={this.handleVisitMerchantInfoPage}
            data-heap-name="ordering.order-detail.contact-us-btn"
          >
            <span data-testid="thanks__self-pickup">{t('ContactUs')}</span>
          </button>
        </Header>

        <div className="ordering-details__container">
          <div className="card">
            <h3 className="text-size-big text-weight-bolder text-uppercase">{t('YourOrder')}</h3>
            <div className="border__bottom-divider">{this.renderOrderDetails()}</div>
          </div>

          <div>
            <ul className="list">
              <li className="item flex flex-space-between flex-middle">
                <span className="text-opacity">{t('Subtotal')}</span>
                <CurrencyNumber className="text-opacity" money={subtotal || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="text-opacity">{t('Tax')}</span>
                <CurrencyNumber className="text-opacity" money={tax || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="text-opacity">{t('DeliveryCharge')}</span>
                <CurrencyNumber className="text-opacity" money={shippingFee || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="text-opacity">{t('Cashback')}</span>
                <CurrencyNumber className="text-opacity" money={-displayDiscount || 0} />
              </li>
              {this.renderPromotion()}
            </ul>
            <div className="flex flex-space-between flex-middle">
              <label className="order-detail__title  text-weight-bolder">{t('Total')}</label>
              <CurrencyNumber className="text-weight-bolder" money={total || 0} />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      order: getOrder(state),
      promotion: getPromotion(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(OrderDetails);
