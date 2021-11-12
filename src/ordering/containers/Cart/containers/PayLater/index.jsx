/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Utils from '../../../../../utils/utils';
import {
  getBusinessInfo,
  getShoppingCart,
  getCartBilling,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';
import CartList from '../../components/CartList';
import { IconClose } from '../../../../../components/Icons';

class PayLater extends Component {
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
    const { shoppingCart, businessInfo, t, storeInfoForCleverTap, pendingCheckingInventory } = this.props;
    const { cartContainerHeight, productsContainerHeight } = this.state;
    const { name } = businessInfo || {};
    const { items } = shoppingCart || {};

    const buttonText = (
      <span className="text-weight-bolder" key="place-order">
        {t('PlaceOrder')}
      </span>
    );

    return (
      <>
        <div>
          <p>Check items before placing your order</p>
        </div>
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

        <footer
          // eslint-disable-next-line no-return-assign
          ref={ref => (this.footerEl = ref)}
          className="footer padding-small flex flex-middle flex-space-between flex__shrink-fixed"
        >
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            onClick={() => {
              // eslint-disable-next-line import/no-named-as-default-member
              loggly.log('cart.place-order');
              CleverTap.pushEvent('Cart Page - click place order', {
                ...storeInfoForCleverTap,
                'Cashback Store': name || '',
              });
              this.handleGtmEventTracking(async () => {
                await this.handleClickContinue();
              });
            }}
            disabled={!items || !items.length || pendingCheckingInventory}
          >
            {pendingCheckingInventory ? t('Processing') : `*`}
            {!pendingCheckingInventory && buttonText}
          </button>
        </footer>
      </>
    );
  }
}

PayLater.displayName = 'PayLater';

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(state => ({
    cartBilling: getCartBilling(state),
    shoppingCart: getShoppingCart(state),
    businessInfo: getBusinessInfo(state),
    storeInfoForCleverTap: getStoreInfoForCleverTap(state),
  }))
)(PayLater);
