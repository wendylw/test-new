import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import _get from 'lodash/get';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import _isNil from 'lodash/isNil';
import Billing from '../../../../components/Billing';
import CartList from '../../components/CartList';
import prefetch from '../../../../../common/utils/prefetch-assets';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
import { actions as promotionActionCreators } from '../../../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getUser,
  getBusinessInfo,
  getShoppingCart,
  getServiceChargeRate,
  getDeliveryDetails,
  getHasLoginGuardPassed,
  getCartBilling,
  getStoreInfoForCleverTap,
  getShippingType,
  getValidBillingTotal,
  getIsValidCreateOrder,
  getIsBillingTotalInvalid,
  getUserConsumerId,
  getUserProfile,
  getIsUserProfileStatusFulfilled,
  getIsWebview,
  getIsTNGMiniProgram,
} from '../../../../redux/modules/app';
import { IconError, IconClose, IconLocalOffer } from '../../../../../components/Icons';
import { loadStockStatus as loadStockStatusThunk } from '../../redux/common/thunks';
import { getCheckingInventoryPendingState, getShouldDisablePayButton } from '../../redux/common/selector';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import CleverTap from '../../../../../utils/clevertap';
import logger from '../../../../../utils/monitoring/logger';
import CreateOrderButton from '../../../../components/CreateOrderButton';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';

const { ROUTER_PATHS } = Constants;

class PayFirst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalComments: Utils.getSessionVariable('additionalComments'),
      cartContainerHeight: '100%',
      productsContainerHeight: '0px',
      pendingBeforeCreateOrder: false,
      shouldShowRedirectLoader: false,
    };
  }

  async componentDidMount() {
    const { appActions, storeInfoForCleverTap } = this.props;

    await appActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
    this.addResizeEventHandler();
    prefetch(['ORD_PMT', 'ORD_PROMO', 'ORD_CI'], ['OrderingPayment', 'OrderingPromotion']);
    CleverTap.pushEvent('Cart page - view cart page', storeInfoForCleverTap);
  }

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  componentWillUnmount = () => {
    this.removeResizeEventHandler();
  };

  handleClickContinue = async () => {
    const { user, history, appActions, loadStockStatus } = this.props;
    const { isLogin } = user || {};

    const { error } = await loadStockStatus();
    const redirectLocation = {
      pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    };

    if (error) {
      await appActions.loadShoppingCart();

      logger.error(
        'Ordering_Cart_CheckStockStatusFailed',
        {
          message: _get(error, 'message', ''),
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.CHECKOUT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.CHECKOUT].SUBMIT_ORDER,
          },
        }
      );

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

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    const { history } = this.props;
    const newSearchParams = Utils.addParamToSearch('pageRefer', 'cart');

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: newSearchParams,
      });
    }, 100);
  };

  handleClickPayButton = () => {
    this.handleClickPayButtonEventTracking();
    this.handleGtmEventTracking(async () => {
      await this.handleClickContinue();
    });
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
    const { history, storeInfoForCleverTap, appActions } = this.props;

    logger.log('Ordering_PayFirstCart_ClearAllItems');

    CleverTap.pushEvent('Cart page - click clear all', storeInfoForCleverTap);

    appActions.clearAll().then(() => {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
      });
    });
  };

  handleClearAdditionalComments = () => {
    Utils.removeSessionVariable('additionalComments');
    this.setState({ additionalComments: null });
  };

  handleResizeEvent = () => {
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
  };

  addResizeEventHandler = () => {
    window.addEventListener('resize', this.handleResizeEvent);
  };

  removeResizeEventHandler = () => {
    window.removeEventListener('resize', this.handleResizeEvent);
  };

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

  handleDismissPromotion = () => {
    this.dismissPromotion();
  };

  dismissPromotion = async () => {
    const { promotionActions, appActions } = this.props;

    await promotionActions.dismissPromotion();
    await appActions.loadShoppingCart();
  };

  handleGotoPromotion = async () => {
    const { history, user, storeInfoForCleverTap, isWebview, appActions } = this.props;
    const { isLogin } = user || {};

    CleverTap.pushEvent('Cart page - click add promo code/voucher', storeInfoForCleverTap);

    if (isLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
      });
      return;
    }

    CleverTap.pushEvent('Login - view login screen', {
      'Screen Name': 'Cart Page',
    });

    if (isWebview) {
      // BEEP-2920: In case users can click on the login button in the beep apps, we need to call the native login method.
      await appActions.loginByBeepApp();
      return;
    }

    // By default, redirect users to the web login page
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  getUpdateShoppingCartItemData = ({ productId, comments, variations }, currentQuantity) => ({
    action: 'edit',
    productId,
    quantity: currentQuantity,
    comments,
    variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
      variationId,
      optionId,
      quantity,
    })),
  });

  handleIncreaseCartItem = cartItem => {
    const { appActions } = this.props;

    logger.log('Ordering_PayFirstCart_AdjustItemQuantity', { action: 'increase' });
    const { quantity } = cartItem;

    this.handleGtmEventTracking(cartItem);
    appActions.addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity + 1)).then(() => {
      appActions.loadShoppingCart();
    });
  };

  handleDecreaseCartItem = cartItem => {
    const { appActions } = this.props;

    logger.log('Ordering_PayFirstCart_AdjustItemQuantity', { action: 'decrease' });
    const { quantity } = cartItem;

    if (quantity <= 1) {
      this.handleRemoveCartItem(cartItem);
    } else {
      appActions.addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity - 1)).then(() => {
        appActions.loadShoppingCart();
      });
    }
  };

  handleRemoveCartItem = cartItem => {
    const { appActions } = this.props;

    logger.log('Ordering_PayFirstCart_AdjustItemQuantity', { action: 'remove' });
    const { productId, comments, variations } = cartItem;

    appActions
      .removeShoppingCartItem({
        productId,
        comments,
        variations,
      })
      .then(() => {
        appActions.loadShoppingCart();
      });
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

  cleverTapTrack = (eventName, attributes = {}) => {
    const { storeInfoForCleverTap } = this.props;

    CleverTap.pushEvent(eventName, { ...storeInfoForCleverTap, ...attributes });
  };

  handleClickPayButtonEventTracking = () => {
    const { cartBilling, businessInfo, storeInfoForCleverTap } = this.props;
    const { name } = businessInfo || {};
    const { cashback, promotion } = cartBilling || {};
    const { promoCode } = promotion || {};

    logger.log('Ordering_PayFirstCart_ClickPayNowButton');
    CleverTap.pushEvent('Cart Page - click pay now', {
      ...storeInfoForCleverTap,
      'promo/voucher applied': promoCode || '',
      'Cashback Amount': cashback || 0,
      'Cashback Store': name || '',
    });
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
    const { pendingBeforeCreateOrder } = this.state;
    return (
      <CreateOrderButton
        className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
        history={history}
        data-testid="pay"
        data-heap-name="ordering.cart.pay-btn"
        disabled={shouldDisablePayButton || pendingBeforeCreateOrder}
        validCreateOrder={isValidCreateOrder}
        beforeCreateOrder={this.handleBeforeCreateOrder}
        afterCreateOrder={this.handleAfterCreateOrder}
        loaderText={t('Processing')}
        processing={pendingCheckingInventory || pendingBeforeCreateOrder}
      >
        {this.getOrderButtonContent()}
      </CreateOrderButton>
    );
  };

  handleBeforeCreateOrder = async () => {
    const {
      history,
      isValidCreateOrder,
      hasLoginGuardPassed,
      deliveryDetails,
      consumerId,
      appActions,
      isUserProfileStatusFulfilled,
      isTNGMiniProgram,
    } = this.props;
    const pathname = hasLoginGuardPassed ? ROUTER_PATHS.ORDERING_PAYMENT : ROUTER_PATHS.ORDERING_LOGIN;
    this.setState({ pendingBeforeCreateOrder: true });

    if (isTNGMiniProgram) {
      this.setState({ shouldShowRedirectLoader: true });
    }

    // if user login, and one of user name or phone is empty from delivery details data,
    // then update them from user profile.
    // Resolve bugs of BEEP-1561 && BEEP-1554
    if (consumerId && (!deliveryDetails.username || !deliveryDetails.phone)) {
      if (!isUserProfileStatusFulfilled) {
        await appActions.getProfileInfo(consumerId);
      }
      const { userProfile } = this.props;

      await appActions.updateDeliveryDetails({
        username: deliveryDetails.username || userProfile.name,
        phone: deliveryDetails.phone || userProfile.phone,
      });
    }

    logger.log('Ordering_PayFirstCart_CreateOrder');
    this.handleClickPayButtonEventTracking();
    this.handleGtmEventTracking(() => {
      if (isValidCreateOrder) return;
      history.push({
        pathname,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
    });

    this.setState({ pendingBeforeCreateOrder: false });
  };

  handleAfterCreateOrder = orderId => {
    this.setState({ shouldShowRedirectLoader: !!orderId });

    const { isValidCreateOrder } = this.props;

    // WB-4594: Please remember the users might go to the payment, then the order id will be empty. This is expected.
    if (isValidCreateOrder && !orderId) {
      logger.error(
        'Ordering_Cart_CreateOrderFailed',
        {
          message: 'Failed to create free order',
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.PAYMENT,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.PAYMENT].SUBMIT_ORDER,
          },
        }
      );
    }
  };

  getOrderButtonContent = () => {
    const { t, pendingCheckingInventory, isBillingTotalInvalid, validBillingTotal } = this.props;
    const { pendingBeforeCreateOrder } = this.state;

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

    return pendingCheckingInventory || pendingBeforeCreateOrder ? processingContent : buttonContent;
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

  showShortPromoCode() {
    const { cartBilling } = this.props;
    const { promotion } = cartBilling || {};
    const SHOW_LENGTH = 5;
    // show like "Promo..."
    if (promotion && promotion.promoCode) {
      if (promotion.promoCode.length > SHOW_LENGTH) {
        return `${promotion.promoCode.substring(0, SHOW_LENGTH)}...`;
      }
      return promotion.promoCode;
    }
    return '';
  }

  renderPromotionItem() {
    const { t, cartBilling } = this.props;
    const { promotion } = cartBilling || {};

    return (
      <li className="flex flex-middle flex-space-between border__top-divider border__bottom-divider">
        {promotion ? (
          <>
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
              - <CurrencyNumber className="text-size-big text-weight-bolder" money={promotion.discount} />
            </div>
          </>
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
          ref={ref => {
            this.additionalCommentsEl = ref;
          }}
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
            onClick={this.handleClearAdditionalComments}
          />
        ) : null}
      </div>
    );
  }

  renderCartList = () => {
    const { shoppingCart } = this.props;
    const { productsContainerHeight } = this.state;
    return (
      <div
        className="ordering-cart__products-container"
        style={{
          minHeight: productsContainerHeight,
        }}
      >
        <CartList
          items={shoppingCart?.items}
          unavailableItems={shoppingCart?.unavailableItems}
          onIncreaseCartItem={this.handleIncreaseCartItem}
          onDecreaseCartItem={this.handleDecreaseCartItem}
          onRemoveCartItem={this.handleRemoveCartItem}
        />
        {this.renderAdditionalComments()}
      </div>
    );
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
      shippingType,
      serviceChargeRate,
    } = this.props;
    const { cartContainerHeight, shouldShowRedirectLoader } = this.state;
    const { items } = shoppingCart || {};
    const { count, subtotal, takeawayCharges, total, tax, serviceCharge, cashback, shippingFee } = cartBilling || {};
    const { isLogin } = user || {};

    if (!(cartBilling && items)) {
      return null;
    }

    if (shouldShowRedirectLoader) {
      return <RedirectPageLoader />;
    }

    return (
      <section className="ordering-cart flex flex-column" data-heap-name="ordering.cart.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-heap-name="ordering.cart.header"
          isPage
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
        />
        <div
          className="ordering-cart__container"
          style={{
            top: `${Utils.mainTop({
              headerEls: [this.headerEl],
            })}px`,
            height: cartContainerHeight,
          }}
        >
          {shippingType === Constants.DELIVERY_METHOD.DINE_IN ? (
            <div className="ordering-cart__warning padding-small flex flex-middle flex-center">
              <IconError className="icon icon__primary icon__smaller" />
              <span>{t('PayNowToPlaceYourOrder')}</span>
            </div>
          ) : null}
          {this.renderCartList()}
          <Billing
            billingRef={ref => {
              this.billingEl = ref;
            }}
            tax={tax}
            serviceCharge={serviceCharge}
            serviceChargeRate={serviceChargeRate}
            businessInfo={businessInfo}
            isTakeAwayType={Utils.isTakeAwayType()}
            takeawayCharges={takeawayCharges}
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
          ref={ref => {
            this.footerEl = ref;
          }}
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
      </section>
    );
  }
}

PayFirst.displayName = 'PayFirst';

PayFirst.propTypes = {
  appActions: PropTypes.shape({
    loadShoppingCart: PropTypes.func,
    clearAll: PropTypes.func,
    addOrUpdateShoppingCartItem: PropTypes.func,
    removeShoppingCartItem: PropTypes.func,
    getProfileInfo: PropTypes.func,
    updateDeliveryDetails: PropTypes.func,
    loginByBeepApp: PropTypes.func,
  }),
  promotionActions: PropTypes.shape({
    dismissPromotion: PropTypes.func,
  }),
  loadStockStatus: PropTypes.func,
  pendingCheckingInventory: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  cartBilling: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  shoppingCart: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  businessInfo: PropTypes.object,
  shippingType: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  storeInfoForCleverTap: PropTypes.object,
  isValidCreateOrder: PropTypes.bool,
  shouldDisablePayButton: PropTypes.bool,
  hasLoginGuardPassed: PropTypes.bool,
  isBillingTotalInvalid: PropTypes.bool,
  validBillingTotal: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  deliveryDetails: PropTypes.object,
  userProfile: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
  }),
  isUserProfileStatusFulfilled: PropTypes.bool,
  consumerId: PropTypes.string,
  serviceChargeRate: PropTypes.number,
  isWebview: PropTypes.bool,
  isTNGMiniProgram: PropTypes.bool,
};

PayFirst.defaultProps = {
  appActions: {
    loadShoppingCart: () => {},
    clearAll: () => {},
    addOrUpdateShoppingCartItem: () => {},
    removeShoppingCartItem: () => {},
    getProfileInfo: () => {},
    updateDeliveryDetails: () => {},
    loginByBeepApp: () => {},
  },
  promotionActions: {
    dismissPromotion: () => {},
  },
  loadStockStatus: () => {},
  pendingCheckingInventory: false,
  user: {},
  cartBilling: {},
  shoppingCart: {},
  businessInfo: {},
  shippingType: null,
  storeInfoForCleverTap: {},
  isValidCreateOrder: false,
  shouldDisablePayButton: false,
  hasLoginGuardPassed: false,
  isBillingTotalInvalid: false,
  validBillingTotal: 0,
  deliveryDetails: {},
  userProfile: {
    name: '',
    phone: '',
  },
  isUserProfileStatusFulfilled: false,
  consumerId: '',
  serviceChargeRate: 0,
  isWebview: false,
  isTNGMiniProgram: false,
};

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(
    state => ({
      pendingCheckingInventory: getCheckingInventoryPendingState(state),
      user: getUser(state),
      cartBilling: getCartBilling(state),
      shoppingCart: getShoppingCart(state),
      serviceChargeRate: getServiceChargeRate(state),
      businessInfo: getBusinessInfo(state),
      shippingType: getShippingType(state),
      validBillingTotal: getValidBillingTotal(state),
      isValidCreateOrder: getIsValidCreateOrder(state),
      shouldDisablePayButton: getShouldDisablePayButton(state),
      hasLoginGuardPassed: getHasLoginGuardPassed(state),
      isBillingTotalInvalid: getIsBillingTotalInvalid(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      deliveryDetails: getDeliveryDetails(state),
      consumerId: getUserConsumerId(state),
      userProfile: getUserProfile(state),
      isUserProfileStatusFulfilled: getIsUserProfileStatusFulfilled(state),
      isWebview: getIsWebview(state),
      isTNGMiniProgram: getIsTNGMiniProgram(state),
    }),
    dispatch => ({
      loadStockStatus: bindActionCreators(loadStockStatusThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(PayFirst);
