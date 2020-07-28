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
import './Receipt.scss';

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
      <div className="receipt__list">
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
                  className="price item__text text-weight-bolder"
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
    const { t, history, order, businessInfo, user, promotion } = this.props;
    const { orderId, tax, serviceCharge, subtotal, total, additionalComments } = order || {};
    const { isLogin } = user || {};

    return (
      <section className="receipt flex flex-column" data-heap-name="ordering.receipt.container">
        <Header
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          title={t('ViewReceipt')}
          data-heap-name="ordering.receipt.header"
          navFunc={this.goBack}
        >
          <span className="flex__shrink-fixed text-opacity">{this.getHeaderContent()}</span>
        </Header>
        <div className="receipt__container">
          <div className="receipt__number-container text-center padding-normal border__bottom-divider">
            <label className="receipt__number-label padding-top-bottom-small margin-top-bottom-smaller text-opacity text-uppercase">
              {t('ReceiptNumber')}
            </label>
            <span className="receipt__number margin-top-bottom-smaller text-size-biggest">{orderId}</span>
          </div>
          {this.renderProductItem()}

          {additionalComments ? (
            <article className="padding-small border__bottom-divider">
              <h4 className="margin-smaller text-weight-bolder text-uppercase">{t('Notes')}</h4>
              <p className="margin-smaller text-opacity">{additionalComments}</p>
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
            creditsBalance={this.getSpendCashback()}
            isLogin={isLogin}
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
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ReceiptDetail);
