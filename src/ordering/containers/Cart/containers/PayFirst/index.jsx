/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Utils from '../../../../../utils/utils';
import { Billing } from '../../../../components/Billing';
import {
  getUser,
  getBusinessInfo,
  getShoppingCart,
  getCartBilling,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';
import CartList from '../../components/CartList';
import { IconClose } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';

class PayFirst extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    cartContainerHeight: '100%',
    productsContainerHeight: '0px',
  };

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  renderAdditionalComments() {
    const { t, shoppingCart } = this.props;
    const { additionalComments } = this.state;
    const { items } = shoppingCart || {};

    if (!shoppingCart || !items.length) {
      return null;
    }

    return (
      <div className="ordering-cart__additional-comments flex flex-middle flex-space-between">
        <textarea
          // eslint-disable-next-line no-return-assign
          ref={ref => (this.additionalCommentsEl = ref)}
          className="ordering-cart__textarea form__textarea padding-small margin-left-right-small"
          rows="2"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          data-heap-name="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments.bind(this)}
          onFocus={this.AdditionalCommentsFocus}
        />
        {additionalComments ? (
          <IconClose
            className="icon icon__big icon__default flex__shrink-fixed"
            data-heap-name="ordering.cart.clear-additional-msg"
            onClick={() => this.handleClearAdditionalComments()}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const {
      cartBilling,
      shoppingCart,
      businessInfo,
      user,
      history,
      t,
      storeInfoForCleverTap,
      pendingCheckingInventory,
    } = this.props;
    const { cartContainerHeight, productsContainerHeight } = this.state;
    const { qrOrderingSettings, name } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { items } = shoppingCart || {};
    const { subtotal, total, tax, serviceCharge, cashback, shippingFee, promotion } = cartBilling || {};
    const { isLogin } = user || {};
    const { promoCode } = promotion || {};

    const isInvalidTotal =
      (Utils.isDeliveryType() && this.getDisplayPrice() < Number(minimumConsumption || 0)) || (total > 0 && total < 1);
    const minTotal = Utils.isDeliveryType() && Number(minimumConsumption || 0) > 1 ? minimumConsumption : 1;
    const buttonText = !isInvalidTotal ? (
      <span className="text-weight-bolder" key="pay-now">
        {t('PayNow')}
      </span>
    ) : (
      <span key="min-total">
        <Trans i18nKey="MinimumConsumption">
          <span className="text-weight-bolder">Min</span>
          <CurrencyNumber className="text-weight-bolder" money={minTotal} />
        </Trans>
      </span>
    );

    if (!(cartBilling && items)) {
      return null;
    }

    return (
      <>
        <div
          className="ordering-cart__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          <div
            className="ordering-cart__products-container"
            style={{
              minHeight: productsContainerHeight,
            }}
          >
            <CartList
              isLazyLoad
              shoppingCart={shoppingCart}
              onIncreaseCartItem={(product = {}) => {
                this.cleverTapTrack('Cart page - Increase quantity', this.formatCleverTapAttributes(product));
              }}
              onDecreaseCartItem={(product = {}) => {
                this.cleverTapTrack('Cart page - Decrease quantity', this.formatCleverTapAttributes(product));
              }}
            />
            {this.renderAdditionalComments()}
          </div>
        </div>
        <Billing
          // eslint-disable-next-line no-return-assign
          billingRef={ref => (this.billingEl = ref)}
          tax={tax}
          serviceCharge={serviceCharge}
          businessInfo={businessInfo}
          subtotal={subtotal}
          total={total}
          creditsBalance={cashback}
          isDeliveryType={Utils.isDeliveryType()}
          shippingFee={shippingFee}
          isLogin={isLogin}
          history={history}
        >
          {this.renderPromotionItem()}
        </Billing>

        <footer
          // eslint-disable-next-line no-return-assign
          ref={ref => (this.footerEl = ref)}
          className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        >
          <button
            className="ordering-cart__button-back button button__fill dark text-uppercase text-weight-bolder flex__shrink-fixed"
            onClick={() => {
              CleverTap.pushEvent('Cart Page - click back button(bottom)');
              this.handleClickBack();
            }}
            data-heap-name="ordering.cart.back-btn"
          >
            {t('Back')}
          </button>
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            onClick={() => {
              // eslint-disable-next-line import/no-named-as-default-member
              loggly.log('cart.pay-now');
              CleverTap.pushEvent('Cart Page - click pay now', {
                ...storeInfoForCleverTap,
                'promo/voucher applied': promoCode || '',
                'Cashback Amount': cashback || 0,
                'Cashback Store': name || '',
              });
              this.handleGtmEventTracking(async () => {
                await this.handleClickContinue();
              });
            }}
            disabled={!items || !items.length || isInvalidTotal || pendingCheckingInventory}
          >
            {pendingCheckingInventory ? t('Processing') : isInvalidTotal && `*`}
            {!pendingCheckingInventory && buttonText}
          </button>
        </footer>
      </>
    );
  }
}

PayFirst.displayName = 'PayFirst';

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(state => ({
    user: getUser(state),
    cartBilling: getCartBilling(state),
    shoppingCart: getShoppingCart(state),
    businessInfo: getBusinessInfo(state),
    storeInfoForCleverTap: getStoreInfoForCleverTap(state),
  }))
)(PayFirst);
