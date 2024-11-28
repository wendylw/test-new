import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import _isNil from 'lodash/isNil';
import { Info } from 'phosphor-react';
import Billing from '../../../../components/Billing';
import CartList from '../../components/CartList';
import prefetch from '../../../../../common/utils/prefetch-assets';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import { PATH_NAME_MAPPING } from '../../../../../common/utils/constants';
import Utils from '../../../../../utils/utils';
import Constants, { REFERRER_SOURCE_TYPES } from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import RedirectPageLoader from '../../../../components/RedirectPageLoader';
import PageProcessingLoader from '../../../../components/PageProcessingLoader';
import { actions as promotionActionCreators } from '../../../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getBusinessInfo,
  getShoppingCart,
  getServiceChargeRate,
  getDeliveryDetails,
  getHasLoginGuardPassed,
  getCartBilling,
  getStoreInfoForCleverTap,
  getPaymentInfoForCleverTap,
  getIsDineType,
  getValidBillingTotal,
  getIsValidCreateOrder,
  getIsBillingTotalInvalid,
  getUserConsumerId,
  getUserProfile,
  getIsUserProfileStatusFulfilled,
  getIsWebview,
  getIsAlipayMiniProgram,
  getEnableCashback,
  getCartApplyCashback,
  getShouldShowCashbackSwitchButton,
  getUserIsLogin,
  getIsFreeOrder,
  getIsGuestCheckout,
} from '../../../../redux/modules/app';
import {
  getUniquePromosAvailableCount,
  getIsLoadUniquePromosAvailableCountFulfilled,
  getLoadUniquePromosAvailableCountCleverTap,
} from '../../../../redux/modules/common/selectors';
import { fetchUniquePromosAvailableCount as fetchUniquePromosAvailableCountThunk } from '../../../../redux/modules/common/thunks';
import { IconError, IconClose, IconLocalOffer } from '../../../../../components/Icons';
import {
  loadStockStatus as loadStockStatusThunk,
  reloadBillingByCashback as reloadBillingByCashbackThunk,
} from '../../redux/common/thunks';
import {
  getCheckingInventoryPendingState,
  getShouldDisablePayButton,
  getIsReloadBillingByCashbackRequestPending,
  getIsReloadBillingByCashbackRequestRejected,
} from '../../redux/common/selector';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import { toast, alert } from '../../../../../common/utils/feedback';
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
      isCreatingOrder: false,
    };
  }

  async componentDidMount() {
    const {
      history,
      appActions,
      storeInfoForCleverTap,
      isGuestCheckout,
      isLogin,
      fetchUniquePromosAvailableCount,
    } = this.props;
    const from = Utils.getCookieVariable('__pl_cp_source');
    Utils.removeCookieVariable('__pl_cp_source');

    if (isGuestCheckout && from === REFERRER_SOURCE_TYPES.LOGIN) {
      history.push({
        pathname: ROUTER_PATHS.ORDERING_PAYMENT,
        search: window.location.search,
      });
    }

    await appActions.loadShoppingCart();

    if (isLogin) {
      fetchUniquePromosAvailableCount();
    }

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();
    this.addResizeEventHandler();
    prefetch(['ORD_PMT', 'ORD_PROMO', 'ORD_CI'], ['OrderingPayment', 'OrderingPromotion']);
    CleverTap.pushEvent('Cart page - view cart page', storeInfoForCleverTap);
  }

  componentDidUpdate(prevProps, prevStates) {
    const {
      isLogin: prevIsLogin,
      isLoadUniquePromosAvailableCountFulfilled: prevIsLoadUniquePromosAvailableCountFulfilled,
    } = prevProps;
    const {
      isLogin,
      fetchUniquePromosAvailableCount,
      isLoadUniquePromosAvailableCountFulfilled,
      loadUniquePromosAvailableCountCleverTap,
    } = this.props;

    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);

    if (isLogin && !prevIsLogin) {
      fetchUniquePromosAvailableCount();
    }

    // Create Clever Tap after unique promo loaded
    if (isLoadUniquePromosAvailableCountFulfilled && !prevIsLoadUniquePromosAvailableCountFulfilled) {
      CleverTap.pushEvent('Cart Page - Promo Indicator', loadUniquePromosAvailableCountCleverTap);
    }
  }

  componentWillUnmount = () => {
    this.removeResizeEventHandler();
  };

  handleClickContinue = async () => {
    const { isLogin, history, appActions, loadStockStatus } = this.props;

    const { error } = await loadStockStatus();
    const redirectLocation = {
      pathname: ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    };

    if (error) {
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

  handleChangeAdditionalComments(e) {
    this.setState({
      additionalComments: e.target.value,
    });

    Utils.setSessionVariable('additionalComments', e.target.value);
  }

  handleClickBack = async () => {
    const { history } = this.props;

    if (this.additionalCommentsEl) {
      await this.additionalCommentsEl.blur();
    }

    // Fixed lazy loading issue. The first item emptied when textarea focused and back to ordering page
    const timer = setTimeout(() => {
      clearTimeout(timer);

      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
        search: window.location.search,
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
    const { history, storeInfoForCleverTap, paymentInfoForCleverTap, appActions } = this.props;

    logger.log('Ordering_PayFirstCart_ClearAllItems');

    CleverTap.pushEvent('Cart page - click clear all', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
    });

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
    const { history, isLogin, storeInfoForCleverTap, paymentInfoForCleverTap, isWebview, appActions } = this.props;

    CleverTap.pushEvent('Cart page - click add promo code/voucher', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
    });

    if (isLogin) {
      history.push({
        pathname: PATH_NAME_MAPPING.ORDERING_REWARDS,
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

  getUpdateShoppingCartItemData = ({ productId, comments, variations, isTakeaway }, currentQuantity) => ({
    action: 'edit',
    productId,
    quantity: currentQuantity,
    comments,
    variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
      variationId,
      optionId,
      quantity,
    })),
    isTakeaway,
  });

  handleIncreaseCartItem = cartItem => {
    const { appActions, paymentInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Cart page - Increase quantity', paymentInfoForCleverTap);

    logger.log('Ordering_PayFirstCart_AdjustItemQuantity', { action: 'increase' });
    const { quantity } = cartItem;

    this.handleGtmEventTracking(cartItem);
    appActions.addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity + 1)).then(() => {
      appActions.loadShoppingCart();
    });
  };

  handleDecreaseCartItem = cartItem => {
    const { appActions, paymentInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Cart page - decrease quantity', paymentInfoForCleverTap);

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
    const { productId, comments, variations, isTakeaway } = cartItem;

    appActions
      .removeShoppingCartItem({
        productId,
        comments,
        variations,
        isTakeaway,
      })
      .then(() => {
        appActions.loadShoppingCart();
      });
  };

  AdditionalCommentsFocus = () => {
    const { paymentInfoForCleverTap } = this.props;

    CleverTap.pushEvent('Cart page - click special instructions', paymentInfoForCleverTap);
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
    const { cartBilling, businessInfo, storeInfoForCleverTap, paymentInfoForCleverTap } = this.props;
    const { name } = businessInfo || {};
    const { cashback, promotion } = cartBilling || {};
    const { promoCode } = promotion || {};

    logger.log('Ordering_PayFirstCart_ClickPayNowButton');
    CleverTap.pushEvent('Cart Page - click pay now', {
      ...storeInfoForCleverTap,
      ...paymentInfoForCleverTap,
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
        data-test-id="ordering.cart.pay-btn"
        onClick={this.handleClickPayButton}
        disabled={shouldDisablePayButton}
      >
        {this.getOrderButtonContent()}
      </button>
    );
  };

  renderCreateOrderButton = () => {
    const { t, history, isValidCreateOrder, pendingCheckingInventory, shouldDisablePayButton } = this.props;
    const { pendingBeforeCreateOrder, isCreatingOrder } = this.state;
    return (
      <CreateOrderButton
        className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
        history={history}
        data-testid="pay"
        data-test-id="ordering.cart.pay-btn"
        disabled={shouldDisablePayButton || pendingBeforeCreateOrder || isCreatingOrder}
        validCreateOrder={isValidCreateOrder}
        beforeCreateOrder={this.handleBeforeCreateOrder}
        afterCreateOrder={this.handleAfterCreateOrder}
        loaderText={t('Processing')}
        processing={pendingCheckingInventory || pendingBeforeCreateOrder || isCreatingOrder}
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
      isAlipayMiniProgram,
      isFreeOrder,
    } = this.props;
    const pathname = hasLoginGuardPassed ? ROUTER_PATHS.ORDERING_PAYMENT : ROUTER_PATHS.ORDERING_LOGIN;
    this.setState({ pendingBeforeCreateOrder: true });

    if (isFreeOrder) {
      this.setState({ isCreatingOrder: true });
    } else if (isAlipayMiniProgram) {
      this.setState({ shouldShowRedirectLoader: true });
    }

    // if user login, and one of user name or phone is empty from delivery details data,
    // then update them from user profile.
    // Resolve bugs of BEEP-1561 && BEEP-1554
    if (consumerId && (!deliveryDetails.username || !deliveryDetails.phone)) {
      if (!isUserProfileStatusFulfilled) {
        await appActions.loadProfileInfo(consumerId);
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

      if (pathname === ROUTER_PATHS.ORDERING_LOGIN) {
        // WB-6075: If users are not logged in, we need to set the referrer source to the login page.
        Utils.setCookieVariable('__pl_cp_source', REFERRER_SOURCE_TYPES.LOGIN);
      }

      history.push({
        pathname,
        search: window.location.search,
        state: { shouldGoBack: true },
      });
    });

    this.setState({ pendingBeforeCreateOrder: false });
  };

  handleAfterCreateOrder = orderId => {
    this.setState({ isCreatingOrder: false });
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

  handleClickLoginButton = async () => {
    const { history, appActions, isWebview } = this.props;

    CleverTap.pushEvent('Login - view login screen', {
      'Screen Name': 'Cart Page',
    });

    if (isWebview) {
      // BEEP-2663: In case users can click on the login button in the beep apps, we need to call the native login method.
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

  handleToggleCashbackSwitch = async event => {
    const { reloadBillingByCashback, appActions, t } = this.props;
    const nextApplyStatus = event.target.checked;

    // Optimistic update
    appActions.updateCashbackApplyStatus(nextApplyStatus);

    await reloadBillingByCashback(nextApplyStatus);

    const { hasUpdateCashbackApplyStatusFailed } = this.props;

    if (hasUpdateCashbackApplyStatusFailed) {
      // Revert cashback apply status to the original one
      appActions.updateCashbackApplyStatus(!nextApplyStatus);
      toast(t(`${nextApplyStatus ? 'ApplyCashbackFailedDescription' : 'RemoveCashbackFailedDescription'}`));
    }
  };

  handleClickCashbackInfoButton = () => {
    const { t } = this.props;

    alert(t('CashbackInfoDescription'), {
      title: t('CashbackInfoTitle'),
      closeButtonContent: t('GotIt'),
    });
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

  renderCashbackItem() {
    const { t, isLogin, isCashbackEnabled, isCashbackApplied, shouldShowSwitchButton, cartBilling } = this.props;
    const { cashback } = cartBilling || {};

    if (!isCashbackEnabled) return null;

    return (
      <li
        className={`padding-top-bottom-small padding-left-right-small border-radius-base flex flex-middle flex-space-between ${
          isLogin ? 'margin-small cart-cashback__item-primary' : ''
        }`}
      >
        <div className="margin-smaller flex flex-middle flex__shrink-fixed">
          <span className="text-size-big text-weight-bolder">{t('BeepCashback')}</span>
          {cashback > 0 ? (
            <button
              className="flex padding-smaller cart-cashback__info-button"
              aria-label="Beep Cashback Info"
              data-test-id="ordering.shopping-cart.pay-first.cashback-info-btn"
              onClick={this.handleClickCashbackInfoButton}
            >
              <Info size={16} />
            </button>
          ) : null}
        </div>
        {isLogin ? (
          <div className="flex flex-middle">
            {shouldShowSwitchButton ? (
              <label className="cart-cashback__switch-container margin-left-right-small" htmlFor="cashback-switch">
                <input
                  id="cashback-switch"
                  className="cart-cashback__toggle-checkbox"
                  type="checkbox"
                  checked={isCashbackApplied}
                  data-test-id="ordering.shopping-cart.pay-first.cashback-switch"
                  onChange={this.handleToggleCashbackSwitch}
                />
                <div className="cart-cashback__toggle-switch" />
              </label>
            ) : null}
            <span
              className={`margin-smaller cart-cashback__switch-label__${
                isCashbackApplied || !shouldShowSwitchButton ? 'active' : 'inactive'
              }`}
            >
              - <CurrencyNumber className="text-size-big" money={cashback || 0} />
            </span>
          </div>
        ) : (
          <button
            onClick={this.handleClickLoginButton}
            className="cart-cashback__button-login button button__fill padding-top-bottom-smaller padding-left-right-normal"
            data-test-id="ordering.cart.cashback.login-btn"
          >
            {t('Login')}
          </button>
        )}
      </li>
    );
  }

  renderPromotionItem() {
    const { t, cartBilling, uniquePromosAvailableCount } = this.props;
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
                data-test-id="ordering.cart.dismiss-promo"
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
            className="cart-promotion__button-acquisition button button__block flex flex-middle flex-space-between text-left padding-top-bottom-smaller padding-left-right-normal"
            onClick={this.handleGotoPromotion}
            data-test-id="ordering.cart.add-promo"
          >
            <div>
              <IconLocalOffer className="icon icon__small icon__primary text-middle flex__shrink-fixed" />
              <span className="margin-left-right-small text-size-big text-middle">{t('AddPromoCode')}</span>
            </div>
            {uniquePromosAvailableCount > 0 ? (
              <div className="cart-promotion__rewards-number-text-container">
                <span className="cart-promotion__rewards-number-text text-size-small text-line-height-base text-weight-bolder padding-top-bottom-smaller">
                  {t('UniquePromosCountText', { uniquePromosAvailableCount })}
                </span>
              </div>
            ) : null}
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
          data-test-id="ordering.cart.additional-msg"
          onChange={this.handleChangeAdditionalComments.bind(this)}
          onFocus={this.AdditionalCommentsFocus}
        />
        {additionalComments ? (
          <IconClose
            className="icon icon__big icon__default flex__shrink-fixed"
            data-test-id="ordering.cart.clear-additional-msg"
            onClick={this.handleClearAdditionalComments}
          />
        ) : null}
      </div>
    );
  }

  renderCartList = () => {
    const { shoppingCart, isDineType } = this.props;
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
          isDineType={isDineType}
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
      storeInfoForCleverTap,
      paymentInfoForCleverTap,
      isDineType,
      serviceChargeRate,
      shouldShowProcessingLoader,
    } = this.props;
    const { cartContainerHeight, shouldShowRedirectLoader } = this.state;
    const { items } = shoppingCart || {};
    const { count, subtotal, takeawayCharges, total, tax, serviceCharge, shippingFee } = cartBilling || {};

    if (!(cartBilling && items)) {
      return null;
    }

    if (shouldShowRedirectLoader) {
      return <RedirectPageLoader />;
    }

    return (
      <section className="ordering-cart flex flex-column" data-test-id="ordering.cart.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle border__bottom-divider"
          contentClassName="flex-middle"
          data-test-id="ordering.cart.header"
          isPage
          title={t('ProductsInOrderText', { count: count || 0 })}
          navFunc={() => {
            CleverTap.pushEvent('Cart page - click back arrow', {
              ...storeInfoForCleverTap,
              ...paymentInfoForCleverTap,
            });
            this.handleClickBack();
          }}
          rightContent={{
            icon: IconDeleteImage,
            text: t('ClearAll'),
            style: {
              color: '#fa4133',
            },
            attributes: {
              'data-test-id': 'ordering.cart.clear-btn',
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
          {isDineType ? (
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
            isDeliveryType={Utils.isDeliveryType()}
            shippingFee={shippingFee}
          >
            {this.renderCashbackItem()}
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
              CleverTap.pushEvent('Cart Page - click back button (bottom)', paymentInfoForCleverTap);
              this.handleClickBack();
            }}
            data-test-id="ordering.cart.back-btn"
          >
            {t('Back')}
          </button>
          {Utils.isQROrder() ? this.renderCreateOrderButton() : this.renderPayOrderButton()}
        </footer>
        <PageProcessingLoader show={shouldShowProcessingLoader} loaderText={t('Loading')} />
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
    updateDeliveryDetails: PropTypes.func,
    loginByBeepApp: PropTypes.func,
    updateCashbackApplyStatus: PropTypes.func,
    loadProfileInfo: PropTypes.func,
  }),
  promotionActions: PropTypes.shape({
    dismissPromotion: PropTypes.func,
  }),
  loadStockStatus: PropTypes.func,
  reloadBillingByCashback: PropTypes.func,
  pendingCheckingInventory: PropTypes.bool,
  isLogin: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  cartBilling: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  shoppingCart: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  businessInfo: PropTypes.object,
  isDineType: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  storeInfoForCleverTap: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  paymentInfoForCleverTap: PropTypes.object,
  isValidCreateOrder: PropTypes.bool,
  shouldDisablePayButton: PropTypes.bool,
  hasLoginGuardPassed: PropTypes.bool,
  isGuestCheckout: PropTypes.bool,
  isBillingTotalInvalid: PropTypes.bool,
  validBillingTotal: PropTypes.number,
  isFreeOrder: PropTypes.bool,
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
  isAlipayMiniProgram: PropTypes.bool,
  isCashbackEnabled: PropTypes.bool,
  isCashbackApplied: PropTypes.bool,
  shouldShowSwitchButton: PropTypes.bool,
  shouldShowProcessingLoader: PropTypes.bool,
  hasUpdateCashbackApplyStatusFailed: PropTypes.bool,
  isLoadUniquePromosAvailableCountFulfilled: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  loadUniquePromosAvailableCountCleverTap: PropTypes.object,
  uniquePromosAvailableCount: PropTypes.number,
  fetchUniquePromosAvailableCount: PropTypes.func,
};

PayFirst.defaultProps = {
  appActions: {
    loadShoppingCart: () => {},
    clearAll: () => {},
    addOrUpdateShoppingCartItem: () => {},
    removeShoppingCartItem: () => {},
    updateDeliveryDetails: () => {},
    loginByBeepApp: () => {},
    updateCashbackApplyStatus: () => {},
    loadProfileInfo: () => {},
  },
  promotionActions: {
    dismissPromotion: () => {},
  },
  loadStockStatus: () => {},
  reloadBillingByCashback: () => {},
  pendingCheckingInventory: false,
  isLogin: false,
  cartBilling: {},
  shoppingCart: {},
  businessInfo: {},
  isDineType: false,
  storeInfoForCleverTap: {},
  paymentInfoForCleverTap: {},
  isValidCreateOrder: false,
  shouldDisablePayButton: false,
  hasLoginGuardPassed: false,
  isGuestCheckout: false,
  isBillingTotalInvalid: false,
  isFreeOrder: false,
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
  isAlipayMiniProgram: false,
  isCashbackEnabled: false,
  isCashbackApplied: false,
  shouldShowSwitchButton: false,
  shouldShowProcessingLoader: false,
  hasUpdateCashbackApplyStatusFailed: false,
  isLoadUniquePromosAvailableCountFulfilled: false,
  loadUniquePromosAvailableCountCleverTap: {},
  uniquePromosAvailableCount: 0,
  fetchUniquePromosAvailableCount: () => {},
};

/* TODO: backend data */
export default compose(
  withTranslation(['OrderingCart', 'OrderingPromotion']),
  connect(
    state => ({
      pendingCheckingInventory: getCheckingInventoryPendingState(state),
      isLogin: getUserIsLogin(state),
      cartBilling: getCartBilling(state),
      shoppingCart: getShoppingCart(state),
      serviceChargeRate: getServiceChargeRate(state),
      businessInfo: getBusinessInfo(state),
      isDineType: getIsDineType(state),
      validBillingTotal: getValidBillingTotal(state),
      isFreeOrder: getIsFreeOrder(state),
      isValidCreateOrder: getIsValidCreateOrder(state),
      shouldDisablePayButton: getShouldDisablePayButton(state),
      hasLoginGuardPassed: getHasLoginGuardPassed(state),
      isGuestCheckout: getIsGuestCheckout(state),
      isBillingTotalInvalid: getIsBillingTotalInvalid(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
      paymentInfoForCleverTap: getPaymentInfoForCleverTap(state),
      deliveryDetails: getDeliveryDetails(state),
      consumerId: getUserConsumerId(state),
      userProfile: getUserProfile(state),
      isUserProfileStatusFulfilled: getIsUserProfileStatusFulfilled(state),
      isWebview: getIsWebview(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
      isCashbackEnabled: getEnableCashback(state),
      isCashbackApplied: getCartApplyCashback(state),
      shouldShowSwitchButton: getShouldShowCashbackSwitchButton(state),
      shouldShowProcessingLoader: getIsReloadBillingByCashbackRequestPending(state),
      hasUpdateCashbackApplyStatusFailed: getIsReloadBillingByCashbackRequestRejected(state),
      uniquePromosAvailableCount: getUniquePromosAvailableCount(state),
      isLoadUniquePromosAvailableCountFulfilled: getIsLoadUniquePromosAvailableCountFulfilled(state),
      loadUniquePromosAvailableCountCleverTap: getLoadUniquePromosAvailableCountCleverTap(state),
    }),
    dispatch => ({
      loadStockStatus: bindActionCreators(loadStockStatusThunk, dispatch),
      reloadBillingByCashback: bindActionCreators(reloadBillingByCashbackThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
      fetchUniquePromosAvailableCount: bindActionCreators(fetchUniquePromosAvailableCountThunk, dispatch),
    })
  )
)(PayFirst);
