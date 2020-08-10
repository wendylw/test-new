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

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import {
  actions as thankYouActionCreators,
  getOrder,
  getBusinessInfo,
  getPromotion,
} from '../../redux/modules/thankYou';
import { getUser } from '../../redux/modules/app';
import Utils from '../../../utils/utils';

const { DELIVERY_METHOD } = Constants;
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

  goBack = () => {
    this.props.history.go(-1);
  };

  getHeaderContent = () => {
    const { order, t } = this.props;

    const type = Utils.getOrderTypeFromUrl();

    switch (type) {
      case DELIVERY_METHOD.DINE_IN:
        const { tableId } = order || {};
        return t('TableIdText', { tableId });
      case DELIVERY_METHOD.TAKE_AWAY:
        return t('TAKE_AWAY');
      case DELIVERY_METHOD.PICKUP:
        return t('SelfPickup');
      case DELIVERY_METHOD.DELIVERY:
        return '';
      default:
        return '';
    }
  };

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
                  className="price item__text font-weight-bolder"
                  money={displayPrice || unitPrice || 0}
                />
              }
            >
              <ItemOperator
                className="flex-middle exhibit"
                data-heap-name="ordering.receipt.item-operator"
                quantity={quantity}
                decreaseDisabled={quantity === 0}
              />
            </Item>
          );
        })}
      </div>
    );
  }

  render() {
    const { t, order, businessInfo, promotion, user } = this.props;
    const { orderId, tax, serviceCharge, subtotal, total, additionalComments } = order || {};
    const { isLogin } = user || {};

    return (
      <section className="table-ordering__receipt" data-heap-name="ordering.receipt.container">
        <Header
          className="border__bottom-divider gray flex-middle"
          title={t('ViewReceipt')}
          data-heap-name="ordering.receipt.header"
          navFunc={this.goBack}
        >
          <span className="gray-font-opacity">{this.getHeaderContent()}</span>
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
          promotion={promotion}
          isLogin={isLogin}
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
      promotion: getPromotion(state),
      user: getUser(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ReceiptDetail);
