/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-fragments */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-lonely-if */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import _isNil from 'lodash/isNil';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import Url from '../../../../../utils/url';
import { get } from '../../../../../utils/request';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import { IconClose, IconLocalOffer } from '../../../../../components/Icons';
import { Billing } from '../../../../components/Billing';
import { actions as promotionActionCreators } from '../../../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getUser,
  getBusinessInfo,
  getShoppingCart,
  getCartBilling,
  getStoreInfoForCleverTap,
} from '../../../../redux/modules/app';
import { actions as cartActionCreators } from '../../../../redux/modules/cart';
import CleverTap from '../../../../../utils/clevertap';
import loggly from '../../../../../utils/monitoring/loggly';
import CartList from '../../components/CartList';
import CurrencyNumber from '../../../../components/CurrencyNumber';

class PayFirst extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    additionalComments: Utils.getSessionVariable('additionalComments'),
  };

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.loadShoppingCart();
  }

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  getDisplayPrice() {
    // eslint-disable-next-line react/prop-types
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  handleClickContinue = async () => {
    const { user, history, appActions, cartActions, deliveryDetails } = this.props;
    const { username, phone: orderPhone } = deliveryDetails || {};
    const { consumerId, isLogin, profile } = user || {};
    const { name, phone } = profile || {};

    const { status } = await cartActions.checkCartInventory();

    if (status === 'reject') {
      await appActions.loadShoppingCart();

      return;
    }

    if (!isLogin) {
      CleverTap.pushEvent('Login - view login screen', {
        'Screen Name': 'Cart Page',
      });
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        nextPage: true,
      });
    }

    // if have name, redirect to customer page
    // if have consumerId, get profile first and update consumer profile, then redirect to next page
    if (isLogin && name) {
      !username && (await appActions.updateDeliveryDetails({ username: name }));
      !orderPhone && (await appActions.updateDeliveryDetails({ phone }));
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    } else {
      if (isLogin && consumerId) {
        const request = Url.API_URLS.GET_CONSUMER_PROFILE(consumerId);
        // eslint-disable-next-line no-shadow
        const { firstName, email, birthday, phone } = await get(request.url);
        // eslint-disable-next-line react/destructuring-assignment
        this.props.appActions.updateProfileInfo({
          name: firstName,
          email,
          birthday,
          phone,
        });
        !username && (await appActions.updateDeliveryDetails({ username: firstName }));
        !orderPhone && (await appActions.updateDeliveryDetails({ phone }));
        firstName
          ? history.push({
              pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
              search: window.location.search,
            })
          : history.push({
              pathname: Constants.ROUTER_PATHS.PROFILE,
              search: window.location.search,
            });
      }
    }
  };

  handleClickBack = async () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);
      console.log('fhj', this.props);
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

  handleGotoPromotion = () => {
    const { user, storeInfoForCleverTap } = this.props;
    const { isLogin } = user || {};

    CleverTap.pushEvent('Cart page - click add promo code/voucher', storeInfoForCleverTap);

    if (isLogin) {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
      });
    } else {
      CleverTap.pushEvent('Login - view login screen', {
        'Screen Name': 'Cart Page',
      });
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  handleDismissPromotion = e => {
    this.dismissPromotion();
  };

  dismissPromotion = async () => {
    const { promotionActions, appActions } = this.props;

    await promotionActions.dismissPromotion();
    await appActions.loadShoppingCart();
  };

  AdditionalCommentsFocus = () => {
    CleverTap.pushEvent('Cart page - click special instructions');
    setTimeout(() => {
      const container = document.querySelector('.ordering-cart__container');
      const productContainer = document.querySelector('.ordering-cart__products-container');

      if (container && productContainer && Utils.getUserAgentInfo().isMobile) {
        container.scrollTop =
          productContainer.clientHeight +
          this.billingEl.clientHeight -
          container.clientHeight -
          (document.body.clientHeight - window.innerHeight);
      }
    }, 300);
  };

  handleClearAll = () => {};

  showShortPromoCode() {
    const { cartBilling } = this.props;
    const { promotion } = cartBilling || {};
    const SHOW_LENGTH = 5;
    // show like "Promo..."
    if (promotion && promotion.promoCode) {
      if (promotion.promoCode.length > SHOW_LENGTH) {
        // eslint-disable-next-line prefer-template
        return promotion.promoCode.substring(0, SHOW_LENGTH) + '...';
      }
      return promotion.promoCode;
    }
    return '';
  }

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

  renderPromotionItem() {
    const { t, cartBilling } = this.props;
    const { promotion } = cartBilling || {};

    return (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        {promotion ? (
          <React.Fragment>
            <div className="cart-promotion__promotion-content flex flex-middle flex-space-between padding-left-right-small text-weight-bolder text-omit__single-line">
              <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
              <span className="margin-left-right-smaller text-size-big text-weight-bolder text-omit__single-line">
                {t(promotion.promoType)} ({this.showShortPromoCode()})
              </span>
              <button
                onClick={this.handleDismissPromotion}
                className="button flex__shrink-fixed"
                data-heap-name="ordering.cart.dismiss-promo"
              >
                <IconClose className="icon icon__small" />
              </button>
            </div>
            <div className="padding-top-bottom-small padding-left-right-normal text-weight-bolder flex__shrink-fixed">
              {'-'} <CurrencyNumber className="text-size-big text-weight-bolder" money={promotion.discount} />
            </div>
          </React.Fragment>
        ) : (
          <button
            className="cart-promotion__button-acquisition button button__block text-left padding-top-bottom-smaller padding-left-right-normal"
            onClick={this.handleGotoPromotion}
            data-heap-name="ordering.cart.add-promo"
          >
            <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
            <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
          </button>
        )}
      </li>
    );
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
          t={t}
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
  connect(
    state => ({
      user: getUser(state),
      cartBilling: getCartBilling(state),
      shoppingCart: getShoppingCart(state),
      businessInfo: getBusinessInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(PayFirst);
