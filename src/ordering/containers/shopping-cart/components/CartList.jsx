import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators } from '../../../redux/modules/app';
import { GTM_TRACKING_EVENTS, gtmEventTracking, STOCK_STATUS_MAPPING } from '../../../../utils/gtm';
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
      Inventory: STOCK_STATUS_MAPPING[product.stockStatus] || STOCK_STATUS_MAPPING.inStock,
      image_count: product.image || 0,
    };

    gtmEventTracking(GTM_TRACKING_EVENTS.ADD_TO_CART, gtmEventDate);
  };

  getOutStockStatus(stockStatus) {
    return ['outOfStock', 'unavailable'].includes(stockStatus);
  }

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
            numberOnly
          />
        ) : null}
        <CurrencyNumber
          className={`cart-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly
        />
      </div>
    );
  }

  renderProductItemRightController(cartItem) {
    const { t, onIncreaseCartItem, onDecreaseCartItem, onRemoveCartItem } = this.props;
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
          onClick={() => onRemoveCartItem(cartItem)}
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
          decreaseDisabled={!quantity}
          increaseDisabled={disabledIncreaseQuantity}
          onDecrease={() => onDecreaseCartItem(cartItem)}
          onIncrease={() => onIncreaseCartItem(cartItem)}
        />
        {stockStatus === 'lowStock' || disabledIncreaseQuantity ? (
          <span className="text-size-small text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand })}</span>
        ) : null}
      </div>
    );
  }

  render() {
    const { items = [], unavailableItems = [], style } = this.props;

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    const cartItems = [...unavailableItems, ...items].sort(sortFn);

    return (
      <ul style={style} data-heap-name="ordering.cart.cart-list">
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
    );
  }
}

CartList.displayName = 'CartList';

CartList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  items: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  unavailableItems: PropTypes.array,
  onIncreaseCartItem: PropTypes.func,
  onDecreaseCartItem: PropTypes.func,
  onRemoveCartItem: PropTypes.func,
};

CartList.defaultProps = {
  style: {},
  items: [],
  unavailableItems: [],
  onIncreaseCartItem: () => {},
  onDecreaseCartItem: () => {},
  onRemoveCartItem: () => {},
};

export default compose(
  withTranslation(),
  connect(dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
  }))
)(CartList);
