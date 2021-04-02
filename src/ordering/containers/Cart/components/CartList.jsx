import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as appActionCreators, getShoppingCart } from '../../../redux/modules/app';
import { getSelectedProductDetail } from '../../../redux/modules/cart';
import Constants from '../../../../utils/constants';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import { IconDelete } from '../../../../components/Icons';
import ProductItem from '../../../components/ProductItem';
import ItemOperator from '../../../../components/ItemOperator';

class CartList extends Component {
  handleGtmEventTracking = product => {
    // In cart page, image count is always either 1 or 0
    const gtmEventDate = {
      product_name: product.title,
      product_id: product.productId,
      price_local: product.displayPrice,
      variant: product.variations,
      quantity: product.quantityOnHand,
      product_type: product.inventoryType,
      Inventory: !!product.markedSoldOut ? 'In stock' : 'Out of stock',
      image_count: product.image || 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventDate);
  };

  getOutStockStatus(stockStatus) {
    return ['outOfStock', 'unavailable'].includes(stockStatus);
  }

  getUpdateShoppingCartItemData({ productId, variations }, currentQuantity) {
    return {
      action: 'edit',
      productId,
      quantity: currentQuantity,
      variations: (variations || []).map(({ variationId, optionId, quantity }) => ({
        variationId,
        optionId,
        quantity,
      })),
    };
  }

  handleRemoveCartItem = cartItem => {
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
    const { quantity } = cartItem;

    if (quantity <= 1) {
      return this.handleRemoveCartItem(cartItem);
    }

    this.props.appActions
      .addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity - 1))
      .then(() => {
        this.props.appActions.loadShoppingCart();
      });
  };

  handleIncreaseCartItem = cartItem => {
    const { quantity } = cartItem;

    this.handleGtmEventTracking(cartItem);
    this.props.appActionCreators
      .addOrUpdateShoppingCartItem(this.getUpdateShoppingCartItemData(cartItem, quantity + 1))
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
      <div className="cart-item__image-cover flex flex-middle flex-center text-center text-line-height-base">
        <span className="text-uppercase">{t('SoldOut')}</span>
      </div>
    );
  }

  renderProductItemPrice(price, originalDisplayPrice) {
    return (
      <div>
        {originalDisplayPrice ? (
          <CurrencyNumber
            className="cart-item__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly={true}
          />
        ) : null}
        <CurrencyNumber
          className={`cart-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly={true}
        />
      </div>
    );
  }

  renderProductItemRightController(cartItem) {
    const { t, onIncreaseCartItem, onDecreaseCartItem } = this.props;
    const { stockStatus, quantity, quantityOnHand } = cartItem;
    const inventoryShortage = Boolean(
      stockStatus !== 'notTrackInventory' && quantityOnHand && quantity >= quantityOnHand
    );
    const classList = ['text-center', ...(inventoryShortage ? ['text-error'] : [])];

    if (this.getOutStockStatus(stockStatus)) {
      return (
        <button
          className="button padding-top-bottom-smaller padding-left-right-normal"
          onClick={this.handleRemoveCartItem(cartItem)}
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
          increaseDisabled={inventoryShortage}
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
        {stockStatus === 'lowStock' ? (
          <span className="text-size-small text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand })}</span>
        ) : null}
      </div>
    );
  }

  render() {
    const { viewAside, selectedProduct, shoppingCart, style } = this.props;
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
      <ul style={style} data-heap-name="ordering.cart.cart-list">
        {cartItems.map(cartItem => {
          const { id, title, variationTexts, displayPrice, image, originalDisplayPrice } = cartItem;

          return (
            <li key={`mini-cart-item-${id}`}>
              <ProductItem
                className="flex-top"
                data-heap-name="ordering.home.mini-cart.cart-item"
                imageUrl={image}
                imageCover={this.renderImageCover()}
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
    );
  }
}

CartList.propTypes = {
  isList: PropTypes.bool,
  style: PropTypes.object,
};

CartList.defaultProps = {
  isList: false,
  style: {},
};

export default connect(
  state => {
    return {
      shoppingCart: getShoppingCart(state),
      selectedProduct: getSelectedProductDetail(state),
    };
  },
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  })
)(CartList);
