import React, { Component } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import Billing from '../../components/Billing';
import CartList from './components/CartList';
import { IconClose, IconLocalOffer } from '../../../components/Icons';
import IconDeleteImage from '../../../images/icon-delete.svg';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import HybridHeader from '../../../components/HybridHeader';
import CurrencyNumber from '../../components/CurrencyNumber';
import CreateOrderButton from '../../components/CreateOrderButton';
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
  getHasLoginGuardPassed,
  getCartBilling,
  getStoreInfoForCleverTap,
  getValidBillingTotal,
  getIsValidCreateOrder,
  getIsBillingTotalInvalid,
} from '../../redux/modules/app';
import {
  actions as cartActionCreators,
  getCheckingInventoryPendingState,
  getShouldDisablePayButton,
} from '../../redux/modules/cart';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../utils/gtm';
import ProductSoldOutModal from './components/ProductSoldOutModal/index';
import './OrderingCart.scss';
import CleverTap from '../../../utils/clevertap';
import _isNil from 'lodash/isNil';
import loggly from '../../../utils/monitoring/loggly';

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

    CleverTap.pushEvent('Cart page - view cart page', this.props.storeInfoForCleverTap);
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
    const { user, history, appActions, cartActions } = this.props;
    const { isLogin } = user || {};
    const { ROUTER_PATHS } = Constants;
    const { status } = await cartActions.checkCartInventory();
    const redirectLocation = {
      pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    };

    if (status === 'reject') {
      await appActions.loadShoppingCart();
      return;
    }

    if (!isLogin) {
      CleverTap.pushEvent('Login - view login screen', {
        'Screen Name': 'Cart Page',
      });
      history.push({
        pathname: ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
        state: { shouldGoBack: false, redirectLocation },
      });
      return;
    }

    history.push(redirectLocation);
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

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      this.props.history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
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
    loggly.log('cart.clear-all-attempt');

    CleverTap.pushEvent('Cart page - click clear all', this.props.storeInfoForCleverTap);

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
        state: { shouldGoBack: true },
      });
    }
  };

  showShortPromoCode() {
    const { cartBilling } = this.props;
    const { promotion } = cartBilling || {};
    const SHOW_LENGTH = 5;
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

  getOrderButtonContent = () => {
    const { t, pendingCheckingInventory, isBillingTotalInvalid, validBillingTotal } = this.props;

    const buttonContent = !isBillingTotalInvalid ? (
      <span className="text-weight-bolder" key="pay-now">
        {t('PayNow')}
      </span>
    ) : (
      <span key="min-total">
        *
        <Trans i18nKey="MinimumConsumption">
          <span className="text-weight-bolder">Min</span>
          <CurrencyNumber className="text-weight-bolder" money={validBillingTotal} />
        </Trans>
      </span>
    );

    const processingContent = (
      <span className="text-weight-bolder" key="pay-wait">
        {t('Processing')}
      </span>
    );

    return pendingCheckingInventory ? processingContent : buttonContent;
  };

  renderPayOrderButton = () => {
    const { shouldDisablePayButton } = this.props;
    return (
      <button
        className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
        data-testid="pay"
        data-heap-name="ordering.cart.pay-btn"
        onClick={this.handleClickPayButton}
        disabled={shouldDisablePayButton}
      >
        {this.getOrderButtonContent()}
      </button>
    );
  };

  renderCreateOrderButton = () => {
    const { t, history, isValidCreateOrder, pendingCheckingInventory, shouldDisablePayButton } = this.props;
    return (
      <CreateOrderButton
        className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
        history={history}
        data-testid="pay"
        data-heap-name="ordering.cart.pay-btn"
        disabled={shouldDisablePayButton}
        validCreateOrder={isValidCreateOrder}
        beforeCreateOrder={this.handleBeforeCreateOrder}
        loaderText={t('Processing')}
        processing={pendingCheckingInventory}
      >
        {this.getOrderButtonContent()}
      </CreateOrderButton>
    );
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

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  handleClickPayButtonEventTracking = () => {
    const { cartBilling, businessInfo, storeInfoForCleverTap } = this.props;
    const { name } = businessInfo || {};
    const { cashback, promotion } = cartBilling || {};
    const { promoCode } = promotion || {};

    loggly.log('cart.pay-now');
    CleverTap.pushEvent('Cart Page - click pay now', {
      ...storeInfoForCleverTap,
      'promo/voucher applied': promoCode || '',
      'Cashback Amount': cashback || 0,
      'Cashback Store': name || '',
    });
  };

  handleClickPayButton = () => {
    this.handleClickPayButtonEventTracking();
    this.handleGtmEventTracking(async () => {
      await this.handleClickContinue();
    });
  };

  handleBeforeCreateOrder = () => {
    const { ROUTER_PATHS } = Constants;
    const { history, isValidCreateOrder, hasLoginGuardPassed } = this.props;
    const pathname = hasLoginGuardPassed ? ROUTER_PATHS.ORDERING_PAYMENT : ROUTER_PATHS.ORDERING_LOGIN;

    loggly.log('cart.create-order-attempt');
    this.handleClickPayButtonEventTracking();
    this.handleGtmEventTracking(() => {
      if (isValidCreateOrder) return;
      history.push({
        pathname,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
    });
  };

  render() {
    const { t, cartBilling, shoppingCart, businessInfo, user, history, storeInfoForCleverTap } = this.props;
    const { isHaveProductSoldOut, cartContainerHeight, productsContainerHeight } = this.state;
    const { items } = shoppingCart || {};
    const { count, subtotal, total, tax, serviceCharge, cashback, shippingFee } = cartBilling || {};
    const { isLogin } = user || {};

    if (!(cartBilling && items)) {
      return null;
    }

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
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
          rightContent={{
            icon: IconDeleteImage,
            text: t('ClearAll'),
            style: {
              color: '#fa4133',
            },
            attributes: {
              'data-heap-name': 'ordering.cart.clear-btn',
            },
            onClick: this.handleClearAll,
          }}
        ></HybridHeader>
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
          {Utils.isQROrder() ? this.renderCreateOrderButton() : this.renderPayOrderButton()}
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

Cart.displayName = 'Cart';

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
        validBillingTotal: getValidBillingTotal(state),
        isValidCreateOrder: getIsValidCreateOrder(state),
        hasLoginGuardPassed: getHasLoginGuardPassed(state),
        shouldDisablePayButton: getShouldDisablePayButton(state),
        isBillingTotalInvalid: getIsBillingTotalInvalid(state),
        storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(Cart);
