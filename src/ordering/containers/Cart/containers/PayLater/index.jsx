/* eslint-disable react/no-unused-state */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import { compose } from 'redux';
import _isNil from 'lodash/isNil';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import { getBusinessInfo, getShoppingCart, getStoreInfoForCleverTap } from '../../../../redux/modules/app';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';
import CartList from '../../components/CartList';
import { IconClose } from '../../../../../components/Icons';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';

const originHeight = document.documentElement.clientHeight || document.body.clientHeight;

class PayLater extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    expandBilling: true,
    cartContainerHeight: '100%',
    productsContainerHeight: '0px',
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.handleResizeEvent();
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  }

  handleResizeEvent() {
    window.addEventListener(
      'resize',
      () => {
        const resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
        if (resizeHeight < originHeight) {
          this.setState({
            expandBilling: false,
          });
        } else {
          this.setState({
            expandBilling: true,
          });
        }
      },
      false
    );
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  setCartContainerHeight = preContainerHeight => {
    const containerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl],
    });

    if (preContainerHeight !== containerHeight) {
      this.setState({
        cartContainerHeight: containerHeight,
      });
    }
  };

  setProductsContainerHeight = preProductsContainerHeight => {
    const productsContainerHeight = Utils.containerHeight({
      headerEls: [this.headerEl],
      footerEls: [this.footerEl, this.billingEl],
    });
    const preHeightNumber = _floor(_replace(preProductsContainerHeight, 'px', ''));
    const currentHeightNumber = _floor(_replace(productsContainerHeight, 'px', ''));

    if (productsContainerHeight > '0px' && Math.abs(currentHeightNumber - preHeightNumber) > 10) {
      this.setState({
        productsContainerHeight,
      });
    }
  };

  handleClickContinue = async () => {};

  AdditionalCommentsFocus = () => {};

  handleClearAll = () => {};

  handleClickBack = async () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      // eslint-disable-next-line react/destructuring-assignment
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        // search: window.location.search,
        search: newSearchParams,
      });
    }, 100);
  };

  handleGtmEventTracking = async callback => {
    const { shoppingCart, cartBilling } = this.props;
    const itemsInCart = shoppingCart.items.map(item => item.id);
    const gtmEventData = {
      product_id: itemsInCart,
      cart_size: cartBilling.count,
      cart_value_local: cartBilling.total,
    };
    gtmEventTracking(GTM_TRACKING_EVENTS.INITIATE_CHECKOUT, gtmEventData, callback);
  };

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  formatCleverTapAttributes(product) {
    return {
      'category name': product.categoryName,
      'category rank': product.categoryRank,
      'product name': product.title,
      'product rank': product.rank,
      'product image url': product.images?.length > 0 ? product.images[0] : '',
      amount: !_isNil(product.originalDisplayPrice) ? product.originalDisplayPrice : product.displayPrice,
      discountedprice: !_isNil(product.originalDisplayPrice) ? product.displayPrice : '',
      'is bestsellar': product.isFeaturedProduct,
      'has picture': product.images?.length > 0,
    };
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
        <div className="ordering-cart__warning">
          <p className="ordering-cart__warning-text">{t('CheckItemsBeforePlaceYourOrder')}</p>
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
            {pendingCheckingInventory ? t('Processing') : ``}
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
  withTranslation(['OrderingCart']),
  connect(state => ({
    shoppingCart: getShoppingCart(state),
    businessInfo: getBusinessInfo(state),
    storeInfoForCleverTap: getStoreInfoForCleverTap(state),
  }))
)(PayLater);
