import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation, Trans } from 'react-i18next';
import _floor from 'lodash/floor';
import _replace from 'lodash/replace';
import _isNil from 'lodash/isNil';
import Billing from '../../../../components/Billing';
import CartList from '../../components/CartList';
import IconDeleteImage from '../../../../../images/icon-delete.svg';
import Utils from '../../../../../utils/utils';
import Constants from '../../../../../utils/constants';
import HybridHeader from '../../../../../components/HybridHeader';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { actions as promotionActionCreators } from '../../../../redux/modules/promotion';
import {
  actions as appActionCreators,
  getUser,
  getBusinessInfo,
  getShoppingCart,
  getCartBilling,
  getStoreInfoForCleverTap,
  getShippingType,
} from '../../../../redux/modules/app';
import { IconError, IconClose, IconLocalOffer } from '../../../../../components/Icons';
import { loadStockStatus as loadStockStatusThunk } from '../../redux/common/thunks';
import { getCheckingInventoryPendingState } from '../../redux/common/selector';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../../utils/gtm';
import CleverTap from '../../../../../utils/clevertap';
import { log } from '../../../../../utils/monitoring/loggly';

class PayFirst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalComments: Utils.getSessionVariable('additionalComments'),
      cartContainerHeight: '100%',
      productsContainerHeight: '0px',
    };
  }

  async componentDidMount() {
    const { appActions, storeInfoForCleverTap } = this.props;

    await appActions.loadShoppingCart();

    window.scrollTo(0, 0);
    this.setCartContainerHeight();
    this.setProductsContainerHeight();

    CleverTap.pushEvent('Cart page - view cart page', storeInfoForCleverTap);
  }

  componentDidUpdate(prevProps, prevStates) {
    this.setCartContainerHeight(prevStates.cartContainerHeight);
    this.setProductsContainerHeight(prevStates.productsContainerHeight);
  }

  handleClickContinue = async () => {
    const { user, history, appActions, loadStockStatus } = this.props;
    const { isLogin } = user || {};

    const { error } = await loadStockStatus();

    if (error) {
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

      return;
    }

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_CUSTOMER_INFO,
      search: window.location.search,
    });
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

    log('cart.clear-all-attempt');

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

  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
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

  handleDismissPromotion = () => {
    this.dismissPromotion();
  };

  dismissPromotion = async () => {
    const { promotionActions, appActions } = this.props;

    await promotionActions.dismissPromotion();
    await appActions.loadShoppingCart();
  };

  handleGotoPromotion = () => {
    const { history, user, storeInfoForCleverTap } = this.props;
    const { isLogin } = user || {};

    CleverTap.pushEvent('Cart page - click add promo code/voucher', storeInfoForCleverTap);

    if (isLogin) {
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_PROMOTION,
        search: window.location.search,
      });
    } else {
      CleverTap.pushEvent('Login - view login screen', {
        'Screen Name': 'Cart Page',
      });
      history.push({
        pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
        search: window.location.search,
      });
    }
  };

  getUpdateShoppingCartItemData = ({ productId, variations }, currentQuantity) => ({
    action: 'edit',
    productId,
    quantity: currentQuantity,
    variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
      variationId,
      optionId,
      quantity,
    })),
  });

  handleIncreaseCartItem = cartItem => {
    const { appActions } = this.props;

    log('cart-list.item-operate-attempt');
    const { quantity } = cartItem;

    this.handleGtmEventTracking(cartItem);
    appActions.addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity + 1)).then(() => {
      appActions.loadShoppingCart();
    });
  };

  handleDecreaseCartItem = cartItem => {
    const { appActions } = this.props;

    log('cart-list.item-operate-attempt');
    const { quantity } = cartItem;

    if (quantity <= 1) {
      this.handleRemoveCartItem(cartItem);
    }

    appActions.addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity - 1)).then(() => {
      appActions.loadShoppingCart();
    });
  };

  handleRemoveCartItem = cartItem => {
    const { appActions } = this.props;

    log('cart-list.item-operate-attempt');
    const { productId, variations } = cartItem;

    appActions
      .removeShoppingCartItem({
        productId,
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
      pendingCheckingInventory,
      shippingType,
    } = this.props;
    const { cartContainerHeight } = this.state;
    const { qrOrderingSettings, name } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { items } = shoppingCart || {};
    const { count, subtotal, total, tax, serviceCharge, cashback, shippingFee, promotion } = cartBilling || {};
    const { promoCode } = promotion || {};
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
          <button
            className="button button__fill button__block padding-normal margin-top-bottom-smaller margin-left-right-small text-uppercase text-weight-bolder"
            data-testid="pay"
            data-heap-name="ordering.cart.pay-btn"
            onClick={() => {
              log('cart.pay-now');
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
};

PayFirst.defaultProps = {
  appActions: {
    loadShoppingCart: () => {},
    clearAll: () => {},
    addOrUpdateShoppingCartItem: () => {},
    removeShoppingCartItem: () => {},
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
      businessInfo: getBusinessInfo(state),
      shippingType: getShippingType(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    dispatch => ({
      loadStockStatus: bindActionCreators(loadStockStatusThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
      promotionActions: bindActionCreators(promotionActionCreators, dispatch),
    })
  )
)(PayFirst);
