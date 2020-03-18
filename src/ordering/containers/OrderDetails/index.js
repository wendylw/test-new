import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import CurrencyNumber from '../../components/CurrencyNumber';
import { actions as thankYouActionCreators, getOrder } from '../../redux/modules/thankYou';

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

  renderOrderBillings() {
    const { order } = this.props;
    const { items } = order || {};
    return (items || []).map(value => {
      const { title, displayPrice } = value;
      return (
        <div className="product-detail__options flex flex-space-between flex-middle">
          <span className="gray-font-opacity">{title}</span>
          <CurrencyNumber className="gray-font-opacity" money={displayPrice} />
        </div>
      );
    });
  }

  render() {
    const { order, t } = this.props;
    const { shippingFee, subtotal, total } = order || '';
    return (
      <section className="store-list__content">
        <header className="header flex flex-space-between flex-middle gray text-uppercase">{t('OrderDetails')}</header>
        <div className="list_container">
          <ul className="list">
            <li className="item border__bottom-divider">
              <summary className="store-info__item font-weight-bold">{t('YourOrder')}</summary>
              <div>{this.renderOrderBillings()}</div>
            </li>
            <li className="item border__bottom-divider">
              <div>
                <div className="product-detail__options flex flex-space-between flex-middle">
                  <span className="gray-font-opacity">{t('Subtotal')}</span>
                  <CurrencyNumber className="gray-font-opacity" money={subtotal} />
                </div>
                <div className="product-detail__options flex flex-space-between flex-middle">
                  <span className="gray-font-opacity">{t('DeliveryCharge')}</span>
                  <CurrencyNumber className="gray-font-opacity" money={shippingFee} />
                </div>
                <summary className="item__title product-detail__options">
                  <div className="flex flex-space-between flex-middle">
                    <span className="font-weight-bold ">{t('Total')}</span>
                    <CurrencyNumber className="font-weight-bold" money={total} />
                  </div>
                </summary>
              </div>
            </li>
          </ul>
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
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(OrderDetails);
