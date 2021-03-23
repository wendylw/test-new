import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators } from '../../../redux/modules/cart';
import { getCartSummary } from '../../../../redux/modules/entities/carts';
// import { getProductById } from '../../../../redux/modules/entities/products';
import {
  actions as appActionCreators,
  getShoppingCartItemsByProducts,
  // getCurrentProduct,
  getShoppingCart,
} from '../../../redux/modules/app';
import { getSelectedProductDetail } from '../../../redux/modules/home';
import Constants from '../../../../utils/constants';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import { IconDelete, IconCart } from '../../../../components/Icons';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Item from '../../../components/Item';
import ItemOperator from '../../../../components/ItemOperator';
import './CartListDrawer.scss';

class CartListDrawer extends Component {
  componentDidMount = async () => {
    await this.props.appActions.loadShoppingCart();
  };

  handleGtmEventTracking = product => {
    // In cart list, image count is always either 1 or 0
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

  handleHideCartAside(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  handleClearAll = async () => {
    const { viewAside } = this.props;

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      await this.props.cartActions.clearAllByProducts(this.props.selectedProductCart.items);
      this.props.appActions.loadShoppingCart();
    } else {
      await this.props.cartActions.clearAll();
      this.props.appActions.loadShoppingCart();
    }
  };

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
    const { quantity, productId, variations } = cartItem;

    this.handleGtmEventTracking(cartItem);
    this.props.appActionCreators
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
            className="product-item__price text-size-small text-line-through"
            money={originalDisplayPrice}
            numberOnly={true}
          />
        ) : null}
        <CurrencyNumber
          className={`product-item__price ${originalDisplayPrice ? 'text-error' : ''}`}
          money={price || 0}
          numberOnly={true}
        />
      </div>
    );
  }

  renderProductItemRightController(cartItem) {
    const { t } = this.props;
    const { stockStatus, quantity, quantityOnHand } = cartItem;
    const lowStockState = quantity > quantityOnHand;
    const classList = ['text-center', ...(lowStockState ? ['text-error'] : [])];

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
          increaseDisabled={lowStockState}
          onDecrease={() => this.handleDecreaseCartItem(cartItem)}
          onIncrease={() => this.handleIncreaseCartItem(cartItem)}
        />
        {stockStatus === 'lowStock' ? (
          <span className="text-size-small text-weight-bolder">{t('LowStockProductQuantity', { quantityOnHand })}</span>
        ) : null}
      </div>
    );
  }

  renderCartList() {
    const { viewAside, product, shoppingCart } = this.props;
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
        cartItem => cartItem.productId === product.id || cartItem.parentProductId === product.id
      );
    }

    return (
      <div
        className="cart-list-aside__list-container"
        style={{
          maxHeight: this.aside ? `${(this.aside.clientHeight || this.aside.offsetHeight) * 0.8}px` : '0',
        }}
      >
        <ul data-heap-name="ordering.common.cart-list">
          {cartItems.map(cartItem => {
            const { id, title, variationTexts, displayPrice, image, originalDisplayPrice } = cartItem;

            return (
              <li key={`cart-item-${id}`}>
                <Item
                  className="flex-top"
                  data-heap-name="ordering.home.mini-cart.cart-item"
                  imageUrl={image}
                  imageCover={this.renderImageCover()}
                  title={title}
                  variation={(variationTexts || []).join(', ')}
                  details={this.renderProductItemPrice(displayPrice, originalDisplayPrice)}
                >
                  {this.renderProductItemRightController(cartItem)}
                </Item>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    const { t, show, cartSummary, viewAside, footerEl } = this.props;
    let { count } = cartSummary || {};

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      count = this.props.selectedProductCart.count;
    }

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
              onClick={this.handleClearAll.bind(this)}
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
      // const currentProductInfo = getCurrentProduct(state);
      return {
        shoppingCart: getShoppingCart(state),
        cartSummary: getCartSummary(state),
        selectedProductCart: getShoppingCartItemsByProducts(state),
        // product: getProductById(state, currentProductInfo.id),
        product: getSelectedProductDetail(state),
      };
    },
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(CartListDrawer);
