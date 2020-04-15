/* eslint-disable jsx-a11y/alt-text */
import qs from 'qs';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Item from '../../../components/Item';
import Billing from '../../components/Billing';
import Header from '../../../components/Header';
import ItemOperator from '../../../components/ItemOperator';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as thankYouActionCreators, getOrder, getBusinessInfo } from '../../redux/modules/thankYou';

export class ReceiptDetail extends Component {
  componentWillMount() {
    const { history, thankYouActions } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    thankYouActions.loadOrder(receiptNumber);
  }

  getSpendCashback() {
    const { order } = this.props;
    const { loyaltyDiscounts } = order || {};
    let totalSpendCashback = 0;

    (loyaltyDiscounts || []).forEach(function(item) {
      if (item.loyaltyType === 'cashback') {
        totalSpendCashback += item.displayDiscount || 0;
      }
    });

    return totalSpendCashback;
  }

  backToThankYou() {
    const { history, order } = this.props;
    const h = config.h();
    const { orderId } = order || {};

    history.replace(`${Constants.ROUTER_PATHS.THANK_YOU}?h=${h}&receiptNumber=${orderId}`, history.location.state);
  }

  renderProductItem() {
    const { order } = this.props;
    const { items } = order || {};

    return (
      <div className="list__container">
        {(items || []).map(item => {
          const { id, title, variationTexts, displayPrice, unitPrice, quantity, image } = item;

          if (item.itemType) {
            return null;
          }

          return (
            <Item
              key={id}
              image={image}
              title={title}
              variation={(variationTexts || []).join(', ')}
              detail={
                <CurrencyNumber
                  className="price item__text font-weight-bolder gray-font-opacity"
                  money={displayPrice || unitPrice || 0}
                />
              }
            >
              <ItemOperator className="flex-middle exhibit" quantity={quantity} decreaseDisabled={quantity === 0} />
            </Item>
          );
        })}
      </div>
    );
  }

  render() {
    const { t, order, businessInfo } = this.props;
    const { orderId, tax, serviceCharge, subtotal, total, tableId, additionalComments } = order || {};

    return (
      <section className="table-ordering__receipt">
        <Header
          className="border__bottom-divider gray"
          title={t('ViewReceipt')}
          navFunc={this.backToThankYou.bind(this)}
        >
          <span className="gray-font-opacity">{tableId ? t('TableIdText', { tableId }) : t('SelfPickUp')}</span>
        </Header>
        <div className="receipt__content text-center">
          <label className="receipt__label gray-font-opacity font-weight-bolder text-uppercase">
            {t('ReceiptNumber')}
          </label>
          <span className="receipt__id-number">{orderId}</span>
        </div>
        {this.renderProductItem()}
        {additionalComments ? (
          <article className="receipt__note border__bottom-divider">
            <h4 className="receipt__title font-weight-bolder text-uppercase">{t('Notes')}</h4>
            <p className="receipt__text gray-font-opacity">{additionalComments}</p>
          </article>
        ) : null}
        <Billing
          tax={tax}
          businessInfo={businessInfo}
          serviceCharge={serviceCharge}
          subtotal={subtotal}
          total={total}
          creditsBalance={this.getSpendCashback()}
        />
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      businessInfo: getBusinessInfo(state),
      order: getOrder(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ReceiptDetail);
