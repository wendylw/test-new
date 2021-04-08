import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import Billing from '../../components/Billing';
import CartList from './components/CartList';
import { IconDelete, IconClose, IconLocalOffer } from '../../../components/Icons';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import Header from '../../../components/Header';
import CurrencyNumber from '../../components/CurrencyNumber';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as promotionActionCreators } from '../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getOnlineStoreInfo,
  getUser,
  getBusiness,
  getBusinessInfo,
  getShoppingCart,
  getCartBilling,
  getStoreInfoForCleverTap,
} from '../../redux/modules/app';
import {
  actions as cartActionCreators,
  getCategoryProductList,
  getAllProductsIds,
  getCheckingInventoryPendingState,
  getSelectedProductDetail,
} from '../../redux/modules/cart';
import { actions as customerActionCreators, getDeliveryDetails } from '../../redux/modules/customer';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../utils/gtm';
import ProductSoldOutModal from './components/ProductSoldOutModal/index';
import './OrderingCart.scss';
import Url from '../../../utils/url';
import { get } from '../../../utils/request';
import CleverTap from '../../../utils/clevertap';
import _isNil from 'lodash';

const originHeight = document.documentElement.clientHeight || document.body.clientHeight;
class Cart extends Component {
  state = {
    expandBilling: true,
    additionalComments: Utils.getSessionVariable('additionalComments'),
    isHaveProductSoldOut: Utils.getSessionVariable('isHaveProductSoldOut'),
    cartContainerHeight: '100%',
    productsContainerHeight: '0px',
  };

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  async componentDidMount() {
    const { appActions } = this.props;

    await appActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.handleResizeEvent();
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
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

  handleClickContinue = async () => {
    const { user, history, appActions, cartActions, customerActions, deliveryDetails } = this.props;
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
      !username && (await customerActions.patchDeliveryDetails({ username: name }));
      !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
        search: window.location.search,
      });
    } else {
      if (isLogin && consumerId) {
        let request = Url.API_URLS.GET_CONSUMER_PROFILE(consumerId);
        let { firstName, email, birthday, phone } = await get(request.url);
        this.props.appActions.updateProfileInfo({
          name: firstName,
          email,
          birthday,
          phone,
        });
        !username && (await customerActions.patchDeliveryDetails({ username: firstName }));
        !orderPhone && (await customerActions.patchDeliveryDetails({ phone: phone }));
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

  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

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

  handleClearAll = () => {
    this.props.appActions.clearAll().then(() => {
      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  handleClearAdditionalComments() {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  }

  handleDismissPromotion = e => {
    this.dismissPromotion();
  };

  dismissPromotion = async () => {
    const { promotionActions, appActions } = this.props;

    await promotionActions.dismissPromotion();
    await appActions.loadShoppingCart();
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

  showShortPromoCode() {
    const { cartBilling } = this.props;
    const { promotion } = cartBilling || {};
    const SHOW_LENGTH = 10;
    // show like "Promo..."
    if (promotion && promotion.promoCode) {
      if (promotion.promoCode.length > SHOW_LENGTH) {
        return promotion.promoCode.substring(0, SHOW_LENGTH) + '...';
      } else {
        return promotion.promoCode;
      }
    } else {
      return '';
    }
  }

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
          ref={ref => (this.additionalCommentsEl = ref)}
          className="ordering-cart__textarea form__textarea padding-small margin-left-right-small"
          rows="2"
          placeholder={t('OrderNotesPlaceholder')}
          maxLength="140"
          value={additionalComments || ''}
          data-heap-name="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments.bind(this)}
          onFocus={this.AdditionalCommentsFocus}
        ></textarea>
        {additionalComments ? (
          <IconClose
            className="icon icon__big icon__default flex__shrink-fixed"
            data-heap-name="ordering.cart.clear-additional-msg"
            onClick={this.handleClearAdditionalComments.bind(this)}
          />
        ) : null}
      </div>
    );
  }

  renderPromotionItem() {
    const { t, cartBilling } = this.props;
    const { promotion } = cartBilling || {};

    return (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        {promotion ? (
          <React.Fragment>
            <span className="flex flex-middle flex-space-between padding-left-right-small text-weight-bolder">
              <IconLocalOffer className="icon icon__small icon__primary text-middle" />
              <div>
                <div className="flex flex-middle text-omit__single-line">
                  <span className="margin-left-right-small text-size-big text-weight-bolder">
                    {t(promotion.promoType)} ({this.showShortPromoCode()})
                  </span>
                  <button
                    onClick={this.handleDismissPromotion}
                    className="button"
                    data-heap-name="ordering.cart.dismiss-promo"
                  >
                    <IconClose className="icon icon__small" />
                  </button>
                </div>
              </div>
            </span>
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
            <IconLocalOffer className="icon icon__small icon__primary text-middle" />
            <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
          </button>
        )}
      </li>
    );
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

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  render() {
    const {
      t,
      cartBilling,
      shoppingCart,
      businessInfo,
      user,
      history,
      storeInfoForCleverTap,
      pendingCheckingInventory,
    } = this.props;
    const { isHaveProductSoldOut, cartContainerHeight, productsContainerHeight } = this.state;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { items } = shoppingCart || {};
    const { count, subtotal, total, tax, serviceCharge, cashback, shippingFee } = cartBilling || {};
    const { isLogin } = user || {};
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
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <Header
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage={true}
          title={t('ProductsInOrderText', { count: count || 0 })}
          navFunc={() => {
            CleverTap.pushEvent('Cart page - click back arrow', storeInfoForCleverTap);
            this.handleClickBack();
          }}
        >
          <button
            className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
            onClick={() => {
              CleverTap.pushEvent('Cart page - click clear all', storeInfoForCleverTap);
              this.handleClearAll();
            }}
            data-heap-name="ordering.cart.clear-btn"
          >
            <IconDelete className="icon icon__normal icon__error text-middle" />
            <span className="text-middle text-size-big text-error">{t('ClearAll')}</span>
          </button>
        </Header>
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
              isLazyLoad={true}
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
          <Billing
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
        </div>
        <footer
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
              CleverTap.pushEvent('Cart Page - click pay now', storeInfoForCleverTap);
              this.handleGtmEventTracking(async () => {
                debugger;
                await this.handleClickContinue();
              });
            }}
            disabled={!items || !items.length || isInvalidTotal || pendingCheckingInventory}
          >
            {pendingCheckingInventory ? t('Processing') : isInvalidTotal && `*`}
            {!pendingCheckingInventory && buttonText}
          </button>
        </footer>
        <ProductSoldOutModal
          show={isHaveProductSoldOut}
          editHandler={() => {
            this.setState({
              isHaveProductSoldOut: null,
            });
            Utils.removeSessionVariable('isHaveProductSoldOut');
          }}
        />
      </section>
    );
  }
}
/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(
    state => {
      return {
        pendingCheckingInventory: getCheckingInventoryPendingState(state),

        business: getBusiness(state),
        user: getUser(state),
        cartBilling: getCartBilling(state),
        shoppingCart: getShoppingCart(state),
        businessInfo: getBusinessInfo(state),
        onlineStoreInfo: getOnlineStoreInfo(state),
        deliveryDetails: getDeliveryDetails(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
        allProductsIds: getAllProductsIds(state),
        categories: getCategoryProductList(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      customerActions: bindActionCreators(customerActionCreators, dispatch),
    })
  )
)(Cart);
