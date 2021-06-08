import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as appActionCreators, getShoppingCart, getCartBilling } from '../../../redux/modules/app';
import { getSelectedProductDetail } from '../../../redux/modules/home';
import Constants from '../../../../utils/constants';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import { IconDelete, IconCart } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';
import ProductItem from '../../../components/ProductItem';
import ItemOperator from '../../../../components/ItemOperator';
import loggly from '../../../../utils/monitoring/loggly';
import './CartListDrawer.scss';

class CartListDrawer extends Component {
  handleGtmEventTracking = selectedProduct => {
    const stockStatusMapping = {
      outOfStock: 'out of stock',
      inStock: 'in stock',
      lowStock: 'low stock',
      unavailable: 'unavailable',
      notTrackInventory: 'not track Inventory',
    };

    // In cart list, image count is always either 1 or 0
    const gtmEventDate = {
      product_name: selectedProduct.title,
      product_id: selectedProduct.productId,
      price_local: selectedProduct.displayPrice,
      variant: selectedProduct.variations,
      quantity: selectedProduct.quantityOnHand,
      product_type: selectedProduct.inventoryType,
      Inventory: stockStatusMapping[selectedProduct.stockStatus] || stockStatusMapping.inStock,
      image_count: selectedProduct.image || 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventDate);
  };

  getOutStockStatus(stockStatus) {
    return ['outOfStock', 'unavailable'].includes(stockStatus);
  }

  handleHideCartAside(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  handleClearCart = async () => {
    loggly.log('cart-list-drawer.clear-all-attempt');

    const { appActions, onClearCart } = this.props;

    if (onClearCart) {
      onClearCart();
    }

    await appActions.clearAll().then(() => appActions.loadShoppingCart());
  };

  handleRemoveCartItem = cartItem => {
    loggly.log('cart-list-drawer.item-operate-attempt');

    const { productId, variations } = cartItem;

    this.props.appActions
      .removeShoppingCartItem({
        productId,
        variations,
      })
      .then(() => {
        this.props.appActions.loadShoppingCart();
      });
  };

  handleDecreaseCartItem = cartItem => {
    loggly.log('cart-list-drawer.item-operate-attempt');

    const { quantity, productId, variations } = cartItem;

    if (quantity === 1) {
      this.handleRemoveCartItem(cartItem);
    } else {
      this.props.appActions
        .addOrUpdateShoppingCartItem({
          action: 'edit',
          productId,
          quantity: quantity - 1,
          variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
            variationId,
            optionId,
            quantity,
          })),
        })
        .then(() => {
          this.props.appActions.loadShoppingCart();
        });
    }
  };

  handleIncreaseCartItem = cartItem => {
    loggly.log('cart-list-drawer.item-operate-attempt');

    const { quantity, productId, variations } = cartItem;

    this.handleGtmEventTracking(cartItem);
    this.props.appActions
      .addOrUpdateShoppingCartItem({
        action: 'edit',
        productId,
        quantity: quantity + 1,
        variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
          variationId,
          optionId,
          quantity,
        })),
      })
      .then(() => {
        this.props.appActions.loadShoppingCart();
      });
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
    const quantityEqualStock = quantityOnHand && quantity === quantityOnHand;
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
    const { viewAside, selectedProduct, shoppingCart } = this.props;

    if (!shoppingCart || viewAside === Constants.ASIDE_NAMES.CARTMODAL_HIDE) {
      return null;
    }

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    let cartItems = [...shoppingCart.unavailableItems, ...shoppingCart.items].sort(sortFn);

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      cartItems = cartItems.filter(
        cartItem => cartItem.productId === selectedProduct.id || cartItem.parentProductId === selectedProduct.id
      );
    }

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
    const { t, show, cartBilling, footerEl } = this.props;
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
                {t('CartItemsInCategory', { cartQuantity: count })}
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

CartListDrawer.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  viewAside: PropTypes.string,
  footerEl: PropTypes.any,
};

CartListDrawer.defaultProps = {
  show: false,
  onToggle: () => {},
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        shoppingCart: getShoppingCart(state),
        cartBilling: getCartBilling(state),
        selectedProduct: getSelectedProductDetail(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(CartListDrawer);
