import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';

import { actions as thankYouActionCreators, getOrder, getPromotion } from '../../redux/modules/thankYou';

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

  handleNeedHelp = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.NEED_HELP,
      search: window.location.search,
    });
  };

  renderOrderBillings() {
    const { order } = this.props;
    const { items } = order || {};

    return (
      <ul className="list">
        {(items || []).map((value, index) => {
          const { title, displayPrice, quantity, variationTexts } = value;

          return (
            <li key={`title-${index}`} className="item flex flex-space-between">
              <div className="flex">
                <span style={{ width: '6vw' }} className="gray-font-opacity">
                  {quantity} x
                </span>
                <div style={{ marginLeft: '2vw' }}>
                  <span className="gray-font-opacity">{title}</span>
                  <p>
                    {variationTexts[0] ? <span className="order-detail__tag">{variationTexts.join(', ')}</span> : null}
                  </p>
                </div>
              </div>
              <CurrencyNumber className="gray-font-opacity" money={displayPrice * quantity} />
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
        <span className="gray-font-opacity">
          {t('Voucher')} ({promotion.promoCode})
        </span>
        <CurrencyNumber className="gray-font-opacity" money={-promotion.discount} />
      </li>
    );
  }

  render() {
    const { order, history, t } = this.props;
    const { shippingFee, subtotal, total, tax, loyaltyDiscounts } = order || '';

    const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

    return (
      <section className="order-detail">
        <Header
          className="order-detail__header flex-middle"
          isPage={false}
          title={t('OrderDetails')}
          navFunc={() =>
            history.replace({
              pathname: Constants.ROUTER_PATHS.THANK_YOU,
              search: window.location.search,
            })
          }
        >
          <button className="link text-uppercase" onClick={this.handleNeedHelp}>
            <span data-testid="thanks__self-pickup">{t('ContactUs')}</span>
          </button>
        </Header>
        <div className="order-detail__info-container">
          <div className="border__bottom-divider">
            <h3 className="order-detail__title font-weight-bolder text-uppercase">{t('YourOrder')}</h3>
            {this.renderOrderBillings()}
          </div>
          <div>
            <ul className="list">
              <li className="item flex flex-space-between flex-middle">
                <span className="gray-font-opacity">{t('Subtotal')}</span>
                <CurrencyNumber className="gray-font-opacity" money={subtotal || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="gray-font-opacity">{t('Tax')}</span>
                <CurrencyNumber className="gray-font-opacity" money={tax || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="gray-font-opacity">{t('DeliveryCharge')}</span>
                <CurrencyNumber className="gray-font-opacity" money={shippingFee || 0} />
              </li>
              <li className="item flex flex-space-between flex-middle">
                <span className="gray-font-opacity">{t('Cashback')}</span>
                <CurrencyNumber className="gray-font-opacity" money={-displayDiscount || 0} />
              </li>
              {this.renderPromotion()}
            </ul>
            <div className="flex flex-space-between flex-middle">
              <label className="order-detail__title  font-weight-bolder">{t('Total')}</label>
              <CurrencyNumber className="font-weight-bolder" money={total || 0} />
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
