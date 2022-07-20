import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getShoppingCart, getCartBilling } from '../../../redux/modules/app';
import {
  removeCartItemsById as removeCartItemsByIdThunk,
  updateCartItems as updateCartItemsThunk,
  clearCart as clearCartThunk,
} from '../../../redux/cart/thunks';
import { getCartItems, getCartUnavailableItems, getCartItemsCount } from '../../../redux/cart/selectors';
import { getSelectedProductDetail } from '../redux/common/selectors';
import Constants from '../../../../utils/constants';
import { GTM_TRACKING_EVENTS, gtmEventTracking, STOCK_STATUS_MAPPING } from '../../../../utils/gtm';
import { IconDelete, IconCart } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';
import ProductItem from '../../../components/ProductItem';
import ItemOperator from '../../../../components/ItemOperator';
import logger from '../../../../utils/monitoring/logger';
import './CartListDrawer.scss';
import { withBackButtonSupport } from '../../../../utils/modal-back-button-support';

class CartListDrawer extends Component {
  onHistoryBackReceived = () => {
    this.closeCartAside();
  };

  componentDidUpdate(prevProps) {
    const { show, onModalVisibilityChanged } = this.props;

    if (show !== prevProps.show) {
      // show status changed
      onModalVisibilityChanged(show);
    }
  }

  handleGtmEventTracking = selectedProduct => {
    // In cart list, image count is always either 1 or 0
    const gtmEventDate = {
      product_name: selectedProduct.title,
      product_id: selectedProduct.productId,
      price_local: selectedProduct.displayPrice,
      variant: selectedProduct.variations,
      quantity: selectedProduct.quantityOnHand,
      product_type: selectedProduct.inventoryType,
      Inventory: STOCK_STATUS_MAPPING[selectedProduct.stockStatus] || STOCK_STATUS_MAPPING.inStock,
      image_count: selectedProduct.image ? 1 : 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventDate);
  };

  getOutStockStatus(stockStatus) {
    return ['outOfStock', 'unavailable'].includes(stockStatus);
  }

  closeCartAside() {
    const { onToggle } = this.props;
    onToggle();
  }

  handleHideCartAside(e) {
    if (e && e.target !== e.currentTarget) {
      return;
    }
    this.closeCartAside();
  }

  handleClearCart = async () => {
    logger.log('cart-list-drawer.clear-all-attempt');

    const { appActions, onClearCart, enablePayLater, clearCart } = this.props;

    if (onClearCart) {
      onClearCart();
    }

    if (enablePayLater) {
      await clearCart();
    } else {
      await appActions.clearAll().then(() => appActions.loadShoppingCart());
    }
  };

  handleRemoveCartItem = cartItem => {
    const { appActions, enablePayLater, removeCartItemsById } = this.props;

    logger.log('cart-list-drawer.item-operate-attempt');

    const { id, productId, variations } = cartItem;

    if (enablePayLater) {
      removeCartItemsById(id);
    } else {
      appActions
        .removeShoppingCartItem({
          productId,
          variations,
        })
        .then(() => {
          appActions.loadShoppingCart();
        });
    }
  };

  handleDecreaseCartItem = cartItem => {
    const { enablePayLater, updateCartItems } = this.props;
    logger.log('cart-list-drawer.item-operate-attempt');

    const { quantity, productId, variations } = cartItem;

    if (quantity === 1) {
      this.handleRemoveCartItem(cartItem);
    } else {
      const selectedOptions = (variations || []).map(({ variationId, optionId, quantity }) => ({
        variationId,
        optionId,
        quantity,
      }));

      enablePayLater
        ? updateCartItems({
            productId,
            quantityChange: -1,
            variations: selectedOptions,
          })
        : this.props.appActions
            .addOrUpdateShoppingCartItem({
              action: 'edit',
              productId,
              quantity: quantity - 1,
              variations: selectedOptions,
            })
            .then(() => {
              this.props.appActions.loadShoppingCart();
            });
    }
  };

  handleIncreaseCartItem = cartItem => {
    const { enablePayLater, updateCartItems } = this.props;
    logger.log('cart-list-drawer.item-operate-attempt');

    const { quantity, productId, variations } = cartItem;
    const selectedOptions = (variations || []).map(({ variationId, optionId, quantity }) => ({
      variationId,
      optionId,
      quantity,
    }));

    this.handleGtmEventTracking(cartItem);

    if (enablePayLater) {
      updateCartItems({
        productId,
        quantityChange: 1,
        variations: selectedOptions,
      });
    } else {
      this.props.appActions
        .addOrUpdateShoppingCartItem({
          action: 'edit',
          productId,
          quantity: quantity + 1,
          variations: selectedOptions,
        })
        .then(() => {
          this.props.appActions.loadShoppingCart();
        });
    }
  };

  renderImageCover(stockStatus) {
    const { t } = this.props;

    if (!this.getOutStockStatus(stockStatus)) {
      return null;
    }

    return (
      <div className="mini-cart__image-cover flex flex-middle flex-center text-center text-line-height-base">
        <span className="text-uppercase">{t('SoldOut')}</span>
      </div>
    );
  }

  renderProductItemPrice(price, originalDisplayPrice) {
    return (
      <div>
        {originalDisplayPrice ? (
          <CurrencyNumber
            className="mini-cart__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly={true}
          />
        ) : null}
        <CurrencyNumber
          className={`mini-cart__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly={true}
        />
      </div>
    );
  }

  renderProductItemRightController(cartItem) {
    const { t, onDecreaseCartItem, onIncreaseCartItem } = this.props;
    const { stockStatus, quantity, quantityOnHand } = cartItem;
    const inventoryShortage = Boolean(
      stockStatus !== 'notTrackInventory' && quantityOnHand && quantity > quantityOnHand
    );
    const quantityEqualStock = !!quantityOnHand && quantity === quantityOnHand;
    const disabledIncreaseQuantity = inventoryShortage || quantityEqualStock;
    const classList = ['text-center', ...(inventoryShortage ? ['text-error'] : [])];

    if (this.getOutStockStatus(stockStatus)) {
      return (
        <button
          className="button padding-top-bottom-smaller padding-left-right-normal"
          onClick={() => this.handleRemoveCartItem(cartItem)}
          data-testid="removeCartItem"
          data-heap-name="ordering.home.mini-cart.remove-item-btn"
        >
          <IconDelete className="icon icon__small icon__error text-middle" />
          <span className="text-middle text-error">{t('Remove')}</span>
        </button>
      );
    }

    return (
      <div className={classList.join(' ')}>
        <ItemOperator
          className="flex-middle"
          data-heap-name="ordering.home.mini-cart.item-operator"
          quantity={quantity}
          decreaseDisabled={!Boolean(quantity)}
          increaseDisabled={disabledIncreaseQuantity}
          onDecrease={() => {
            if (onDecreaseCartItem) {
              onDecreaseCartItem(cartItem);
            }

            this.handleDecreaseCartItem(cartItem);
          }}
          onIncrease={() => {
            if (onIncreaseCartItem) {
              onIncreaseCartItem(cartItem);
            }

            this.handleIncreaseCartItem(cartItem);
          }}
        />
        {stockStatus === 'lowStock' || disabledIncreaseQuantity ? (
          <span className="text-size-small text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand })}</span>
        ) : null}
      </div>
    );
  }

  renderCartList() {
    const { viewAside, shoppingCart, enablePayLater, cartAvailableItems, cartUnavailableItems } = this.props;
    const emptyCart = enablePayLater ? !cartAvailableItems.length && !cartUnavailableItems.length : !shoppingCart;
    const hiddenMiniCart = viewAside === Constants.ASIDE_NAMES.CARTMODAL_HIDE;

    if (emptyCart || hiddenMiniCart) {
      return null;
    }

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    const cartItems = (enablePayLater
      ? [...cartUnavailableItems, ...cartAvailableItems]
      : [...shoppingCart.unavailableItems, ...shoppingCart.items]
    ).sort(sortFn);

    return (
      <div
        className="cart-list-aside__list-container"
        style={{
          maxHeight: this.aside ? `${(this.aside.clientHeight || this.aside.offsetHeight) * 0.8}px` : '0',
        }}
      >
        <ul data-heap-name="ordering.home.mini-cart.cart-list">
          {cartItems.map(cartItem => {
            const { id, title, variationTexts, displayPrice, image, originalDisplayPrice, stockStatus } = cartItem;

            return (
              <li key={`mini-cart-item-${id}`}>
                <ProductItem
                  className="flex-top"
                  data-heap-name="ordering.home.mini-cart.cart-item"
                  imageUrl={image}
                  imageCover={this.renderImageCover(stockStatus)}
                  title={title}
                  variation={(variationTexts || []).join(', ')}
                  details={this.renderProductItemPrice(displayPrice, originalDisplayPrice)}
                >
                  {this.renderProductItemRightController(cartItem)}
                </ProductItem>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    const { t, show, enablePayLater, cartBilling, cartProductsCount, footerEl } = this.props;
    let { count } = cartBilling || {};

    const className = ['cart-list-aside aside fixed-wrapper'];

    if (show) {
      className.push('active');
    }

    return (
      <aside
        className={className.join(' ')}
        onClick={e => this.handleHideCartAside(e)}
        data-heap-name="ordering.home.mini-cart.container"
        ref={ref => (this.aside = ref)}
        style={{
          bottom: footerEl ? `${footerEl.clientHeight || footerEl.offsetHeight}px` : '0',
        }}
      >
        <div className="cart-list-aside__container aside__content absolute-wrapper">
          <div className="cart-list-aside__operation border__bottom-divider flex flex-middle flex-space-between absolute-wrapper border-radius-base">
            <div className="cart-list-aside__icon-cart padding-left-right-small margin-left-right-smaller">
              <IconCart className="icon icon__small text-middle" />
              <span className="cart-list-aside__item-number text-middle margin-left-right-smaller text-weight-bolder">
                {t('CartItemsInCategory', { cartQuantity: enablePayLater ? cartProductsCount : count })}
              </span>
            </div>
            <button
              className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
              onClick={this.handleClearCart}
              data-testid="clearAll"
              data-heap-name="ordering.home.mini-cart.clear-btn"
            >
              <IconDelete className="icon icon__normal icon__error text-middle" />
              <span className="text-middle text-size-big text-error">{t('ClearAll')}</span>
            </button>
          </div>
          {this.renderCartList()}
        </div>
      </aside>
    );
  }
}
CartListDrawer.displayName = 'CartListDrawer';

CartListDrawer.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  onModalVisibilityChanged: PropTypes.func,
  onClearCart: PropTypes.func,
  onDecreaseCartItem: PropTypes.func,
  onIncreaseCartItem: PropTypes.func,
  viewAside: PropTypes.string,
  footerEl: PropTypes.any,
  enablePayLater: PropTypes.bool,
  appActions: PropTypes.object,
  removeCartItemsById: PropTypes.func,
  updateCartItems: PropTypes.func,
  clearCart: PropTypes.func,
};

CartListDrawer.defaultProps = {
  show: false,
  enablePayLater: false,
  onToggle: () => {},
  onModalVisibilityChanged: () => {},
  onDecreaseCartItem: () => {},
  onIncreaseCartItem: () => {},
  onClearCart: () => {},
  appActions: () => {},
  removeCartItemsById: () => {},
  updateCartItems: () => {},
  clearCart: () => {},
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => ({
      shoppingCart: getShoppingCart(state),
      cartBilling: getCartBilling(state),
      selectedProduct: getSelectedProductDetail(state),
      cartAvailableItems: getCartItems(state),
      cartUnavailableItems: getCartUnavailableItems(state),
      cartProductsCount: getCartItemsCount(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      removeCartItemsById: bindActionCreators(removeCartItemsByIdThunk, dispatch),
      updateCartItems: bindActionCreators(updateCartItemsThunk, dispatch),
      clearCart: bindActionCreators(clearCartThunk, dispatch),
    })
  ),
  withBackButtonSupport
)(CartListDrawer);
