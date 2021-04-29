/* eslint-disable jsx-a11y/alt-text */
import qs from 'qs';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import ProductItem from '../../../../components/ProductItem';
import Billing from '../../../../components/Billing';
import Header from '../../../../../components/Header';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { actions as orderStatusActionCreators, getOrder, getPromotion } from '../../redux/common';
import { getUser, getBusinessInfo } from '../../../../redux/modules/app';
import Utils from '../../../../../utils/utils';
import './Receipt.scss';

const { DELIVERY_METHOD } = Constants;
export class ReceiptDetail extends Component {
  componentWillMount() {
    const { history, loadOrder } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    loadOrder(receiptNumber);
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
      <div className="receipt__list">
        {(items || []).map(item => {
          const { id, title, variationTexts, displayPrice, unitPrice, quantity, image } = item;

          if (item.itemType) {
            return null;
          }

          return (
            <ProductItem
              key={`receipt-item-${id}`}
              className="flex-middle"
              imageUrl={image}
              title={title}
              variation={(variationTexts || []).join(', ')}
              details={
                <CurrencyNumber
                  className="receipt-item__price text-weight-bolder"
                  money={displayPrice || unitPrice || 0}
                />
              }
            >
              <span className="text-size-small margin-small">{quantity}</span>
            </ProductItem>
          );
        })}
      </div>
    );
  }

  render() {
    const { t, history, order, businessInfo, promotion } = this.props;
    const { orderId, tax, serviceCharge, subtotal, total, additionalComments } = order || {};

    return (
      <section className="receipt flex flex-column" data-heap-name="ordering.receipt.container">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          title={t('ViewReceipt')}
          data-heap-name="ordering.receipt.header"
          navFunc={this.goBack}
        >
          <span className="flex__shrink-fixed text-opacity padding-left-right-small">{this.getHeaderContent()}</span>
        </Header>
        <div className="receipt__container">
          <div className="receipt__number-container text-center padding-normal border__bottom-divider">
            <label className="receipt__number-label padding-top-bottom-small margin-top-bottom-small text-opacity text-uppercase">
              {t('ReceiptNumber')}
            </label>
            <span className="receipt__number margin-top-bottom-small text-size-biggest">{orderId}</span>
          </div>
          {this.renderProductItem()}

          {additionalComments ? (
            <article className="padding-small border__bottom-divider">
              <h4 className="margin-small text-weight-bolder text-uppercase">{t('Notes')}</h4>
              <p className="margin-small text-opacity">{additionalComments}</p>
            </article>
          ) : null}
          <Billing
            history={history}
            tax={tax}
            businessInfo={businessInfo}
            serviceCharge={serviceCharge}
            subtotal={subtotal}
            total={total}
            promotion={promotion}
            isLogin={true}
            creditsBalance={this.getSpendCashback()}
          />
        </div>
      </section>
    );
  }
}

export default compose(
  withTranslation(),
  connect(
    state => ({
      user: getUser(state),
      businessInfo: getBusinessInfo(state),
      order: getOrder(state),
      promotion: getPromotion(state),
    }),
    {
      loadOrder: orderStatusActionCreators.loadOrder,
    }
  )
)(ReceiptDetail);
