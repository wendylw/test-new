import React, { Component } from 'react';
import _isNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { actions as appActionCreators } from '../../../redux/modules/app';
import { GTM_TRACKING_EVENTS, gtmEventTracking, STOCK_STATUS_MAPPING } from '../../../../utils/gtm';
import { PRODUCT_STOCK_STATUS } from '../../../../common/utils/constants';
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
    return [PRODUCT_STOCK_STATUS.OUT_OF_STOCK, PRODUCT_STOCK_STATUS.UNAVAILABLE].includes(stockStatus);
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
      <div className="margin-top-bottom-smaller">
        {originalDisplayPrice ? (
          <CurrencyNumber
            className="cart-item__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly
          />
        ) : null}{' '}
        <CurrencyNumber
          className={`cart-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly
        />
      </div>
    );
  }

  renderCartItemComments(comments) {
    return comments ? (
      <p className="cart-item__comments padding-top-bottom-smaller text-size-small text-line-height-higher">
        {comments}
      </p>
    ) : null;
  }

  renderProductItemRightController(cartItem) {
    const { t, onIncreaseCartItem, onDecreaseCartItem, onRemoveCartItem } = this.props;
    const { stockStatus, quantity, quantityOnHand } = cartItem;
    // WB-5927: if it is pre-order item, quantityOnHand will be undefined but we should allow user to add items to cart.
    const isInfiniteInventory = _isNil(quantityOnHand);
    const isItemUntracked = stockStatus === PRODUCT_STOCK_STATUS.NOT_TRACK_INVENTORY || isInfiniteInventory;
    const isItemLowStock = stockStatus === PRODUCT_STOCK_STATUS.LOW_STOCK;
    const isAbleToIncreaseQuantity = isItemUntracked || quantity < quantityOnHand;
    const isItemQuantityExceedStockOnHand = !isItemUntracked && quantity > quantityOnHand;
    const isAbleToDecreaseQuantity = quantity > 0;
    const classList = ['text-center', ...(isItemQuantityExceedStockOnHand ? ['text-error'] : [])];

    if (this.getOutStockStatus(stockStatus)) {
      return (
        <button
          className="button padding-top-bottom-smaller padding-left-right-normal"
          onClick={() => onRemoveCartItem(cartItem)}
          data-testid="removeCartItem"
          data-test-id="ordering.home.mini-cart.remove-item-btn"
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
          data-test-id="ordering.home.mini-cart.item-operator"
          quantity={quantity}
          decreaseDisabled={!isAbleToDecreaseQuantity}
          increaseDisabled={!isAbleToIncreaseQuantity}
          onDecrease={() => onDecreaseCartItem(cartItem)}
          onIncrease={() => onIncreaseCartItem(cartItem)}
        />
        {isItemLowStock || !isAbleToIncreaseQuantity ? (
          <span className="text-size-small text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand })}</span>
        ) : null}
      </div>
    );
  }

  render() {
    const { items = [], unavailableItems = [], style, isDineType } = this.props;

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    const cartItems = [...unavailableItems, ...items].sort(sortFn);

    return (
      <ul style={style} data-test-id="ordering.cart.cart-list">
        {cartItems.map(cartItem => {
          const {
            id,
            title,
            variationTexts,
            isTakeaway,
            displayPrice,
            image,
            originalDisplayPrice,
            stockStatus,
            comments,
          } = cartItem;
          const commentsEl = this.renderCartItemComments(comments);
          const shouldShowTakeawayVariant = isDineType && isTakeaway;
          const detailsEl = commentsEl ? (
            <>
              {this.renderProductItemPrice(displayPrice, originalDisplayPrice)}
              {commentsEl}
            </>
          ) : (
            this.renderProductItemPrice(displayPrice, originalDisplayPrice)
          );

          return (
            <li key={`mini-cart-item-${id}`}>
              <ProductItem
                className="flex-top"
                data-test-id="ordering.home.mini-cart.cart-item"
                imageUrl={image}
                imageCover={this.renderImageCover(stockStatus)}
                title={title}
                variation={(variationTexts || []).join(', ')}
                shouldShowTakeawayVariant={shouldShowTakeawayVariant}
                details={detailsEl}
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
  isDineType: PropTypes.bool,
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
  isDineType: false,
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
