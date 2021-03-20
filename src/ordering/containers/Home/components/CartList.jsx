import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';

import { getProductById } from '../../../../redux/modules/entities/products';
import { actions as homeActionCreators, getShoppingCart, getCurrentProduct } from '../../../redux/modules/home';
import Constants from '../../../../utils/constants';
import constants from '../../../../utils/constants';
import { GTM_TRACKING_EVENTS, gtmEventTracking } from '../../../../utils/gtm';
import CurrencyNumber from '../../../components/CurrencyNumber';
import Tag from '../../../../components/Tag';
import Item from '../../../components/Item';
import { ItemOperator } from '../../../../components/ItemOperator';

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

  handleDecreaseCartItem = cartItem => {
    const { quantity, productId, variations } = cartItem;

    if (quantity === 1) {
      this.props.homeActions
        .removeShoppingCartItem({
          productId,
          variations,
        })
        .then(() => {
          this.props.homeActions.loadShoppingCart();
        });
    } else {
      this.props.homeActions
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
          this.props.homeActions.loadShoppingCart();
        });
    }
  };

  handleIncreaseCartItem = cartItem => {
    const { quantity, productId, variations } = cartItem;

    this.handleGtmEventTracking(cartItem);
    this.props.homeActions
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
        this.props.homeActions.loadShoppingCart();
      });
  };

  renderImageCover(stockStatus) {
    const { t } = this.props;

    if (!['outOfStock', 'unavailable'].includes(stockStatus)) {
      return null;
    }

    return (
      <div className="cart-item__image-cover">
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

    if (['outOfStock', 'unavailable'].includes(stockStatus)) {
      return <Tag text={t('SoldOut')} className="product-item__tag tag tag__default text-size-big" />;
    }

    return (
      <ItemOperator
        className="flex-middle"
        data-heap-name="ordering.home.cart-item.item-operator"
        quantity={quantity}
        decreaseDisabled={!Boolean(quantity)}
        increaseDisabled={quantity > quantityOnHand}
        onDecrease={() => this.handleDecreaseCartItem(cartItem)}
        onIncrease={() => this.handleIncreaseCartItem(cartItem)}
      />
    );
  }

  render() {
    const { shoppingCart, viewAside, product, style } = this.props;
    if (!shoppingCart || viewAside === constants.ASIDE_NAMES.CARTMODAL_HIDE) {
      return null;
    }

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    let cartItems = [...shoppingCart.unavailableItems, ...shoppingCart.items].sort(sortFn);

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      cartItems = cartItems.filter(x => x.productId === product.id || x.parentProductId === product.id);
    }

    return (
      <ul style={style} data-heap-name="ordering.common.cart-list">
        {cartItems.map(cartItem => {
          const { id, title, variationTexts, displayPrice, image, originalDisplayPrice } = cartItem;

          return (
            <li key={`cart-item-${id}`}>
              <Item
                className="flex-top"
                data-heap-name="ordering.home.cart-item"
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
    );
  }
}

CartList.propTypes = {
  style: PropTypes.object,
};

CartList.defaultProps = {
  style: {},
};

export default connect(
  withTranslation(['OrderingHome']),
  state => {
    const currentProductInfo = getCurrentProduct(state);
    return {
      shoppingCart: getShoppingCart(state),
      product: getProductById(state, currentProductInfo.id),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActionCreators, dispatch),
  })
)(CartList);
